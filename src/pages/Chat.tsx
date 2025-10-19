import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Send, ArrowLeft, Loader2, Mic, Volume2, VolumeX, Shield, DollarSign, Heart, Dumbbell, GraduationCap, User, Sparkles, Phone, AlertTriangle, MicIcon, VolumeX as AlarmIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceRecognition, VoiceSynthesis, VoiceActivation, EmergencyShakeDetector, EmergencyAlarm, EnhancedVoiceRecognitionWrapper } from "@/utils/voiceUtils";
import { PERSONAS, DEFAULT_PERSONA_KEY, type PersonaKey } from "@/utils/personas";
import { EmergencyService, EMERGENCY_MESSAGES, EmergencyAlertSystem, EMERGENCY_ALERT_TEMPLATES } from "@/utils/emergencyUtils";
import { SafetyMonitoringAssistant } from "@/utils/safetyMonitor";
import { 
  sanitizeInput, 
  detectPromptInjection, 
  checkRateLimit,
  chatMessageSchema,
  initializeSessionTimeout,
  clearSessionTimeout
} from "@/utils/validation";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface QuickAction {
  icon: any;
  label: string;
  prompt: string;
  color: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceActivationEnabled, setVoiceActivationEnabled] = useState(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [alarmPlaying, setAlarmPlaying] = useState(false);
  const [persona, setPersona] = useState<PersonaKey>(() => {
    const saved = localStorage.getItem("mentor-persona") as PersonaKey | null;
    return saved && PERSONAS[saved] ? saved : DEFAULT_PERSONA_KEY;
  });
  const [userName, setUserName] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceRecognitionRef = useRef<VoiceRecognition>(new VoiceRecognition());
  const enhancedVoiceRef = useRef<EnhancedVoiceRecognitionWrapper>(new EnhancedVoiceRecognitionWrapper());
  const voiceSynthesisRef = useRef<VoiceSynthesis>(new VoiceSynthesis());
  const voiceActivationRef = useRef<VoiceActivation>(new VoiceActivation());
  const emergencyShakeRef = useRef<EmergencyShakeDetector>(new EmergencyShakeDetector());
  const emergencyAlarmRef = useRef<EmergencyAlarm>(new EmergencyAlarm());
  const emergencyServiceRef = useRef<EmergencyService>(new EmergencyService());
  const emergencyAlertRef = useRef<EmergencyAlertSystem>(new EmergencyAlertSystem());
  const safetyMonitorRef = useRef<SafetyMonitoringAssistant>(new SafetyMonitoringAssistant());

  const quickActions: QuickAction[] = [
    { icon: DollarSign, label: "Financial Advice", prompt: "I need help with budgeting and managing my finances", color: "primary" },
    { icon: Dumbbell, label: "Fitness Plan", prompt: "Create a personalized workout routine for my fitness goals", color: "accent" },
    { icon: Heart, label: "Mental Wellness", prompt: "I need support with stress management and emotional wellness", color: "secondary" },
    { icon: GraduationCap, label: "Life Skills", prompt: "Teach me practical life skills like managing bills and taxes", color: "primary" },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        // Get user profile for personalization
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('username, full_name')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile?.username) {
          setUserName(profile.username);
        } else if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        } else {
          const name = session.user.email?.split('@')[0] || "Friend";
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    };
    checkAuth();

    // Initialize session timeout (30 minutes of inactivity)
    const cleanup = initializeSessionTimeout(async () => {
      await supabase.auth.signOut();
      toast({
        title: "Session Expired",
        description: "You've been logged out due to inactivity.",
        variant: "destructive",
      });
      navigate('/auth');
    });

    return cleanup;
  }, [navigate, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize emergency shake detection and safety monitoring
  useEffect(() => {
    if (emergencyShakeRef.current.isSupported()) {
      emergencyShakeRef.current.start(handleEmergency);
    }

    // Initialize safety monitoring
    safetyMonitorRef.current.startMonitoring(emergencyAlertRef.current);

    return () => {
      emergencyShakeRef.current.stop();
      safetyMonitorRef.current.stopMonitoring();
      // Stop alarm if component unmounts
      if (emergencyAlarmRef.current.isAlarmPlaying()) {
        emergencyAlarmRef.current.stopAlarm();
      }
    };
  }, []);

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setShowQuickActions(false);
  };

  const handleSend = async (customPrompt?: string) => {
    const messageToSend = customPrompt || input.trim();
    if (!messageToSend || loading) return;

    const userMessage = messageToSend;

    // Validate message length
    const validation = chatMessageSchema.safeParse({ content: userMessage });
    if (!validation.success) {
      toast({
        title: "Invalid Message",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Check rate limit (10 messages per minute)
    const { data: { user } } = await supabase.auth.getUser();
    const rateLimitKey = `chat_${user?.id}`;
    const rateLimitCheck = checkRateLimit(rateLimitKey, 10, 60000);
    
    if (!rateLimitCheck.allowed) {
      toast({
        title: "Rate Limit Exceeded",
        description: `Please wait ${rateLimitCheck.retryAfter} seconds before sending another message.`,
        variant: "destructive",
      });
      return;
    }

    // Sanitize input
    const sanitizedMessage = sanitizeInput(userMessage);

    // Detect prompt injection attempts
    if (detectPromptInjection(sanitizedMessage)) {
      toast({
        title: "Security Warning",
        description: "Your message contains potentially unsafe content. Please rephrase.",
        variant: "destructive",
      });
      return;
    }

    if (!customPrompt) setInput("");
    setMessages(prev => [...prev, { role: 'user', content: sanitizedMessage }]);
    setShowQuickActions(false);
    setLoading(true);

    try {
      // Get language preference
      const language = localStorage.getItem("language") || "en";
      
      console.log('Sending to mentor-chat:', {
        messagesCount: messages.length + 1,
        language
      });
      
      const { data, error } = await supabase.functions.invoke('mentor-chat', {
        body: { 
          messages: [...messages, { role: 'user', content: sanitizedMessage }],
          language: language,
          persona: PERSONAS[persona]
        }
      });

      console.log('Response from mentor-chat:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        // Handle specific error types
        if (error.message?.includes('Rate limit')) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
        throw error;
      }

      if (data?.content) {
        const aiResponse = data.content;
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse
        }]);

        // Read aloud if voice is enabled
        if (voiceEnabled) {
          const savedVoice = localStorage.getItem("ai-voice");
          const voices = voiceSynthesisRef.current.getVoices();
          
          // Try to find a voice matching the language
          let selectedVoice: SpeechSynthesisVoice | undefined;
          
          if (savedVoice && savedVoice !== "default") {
            selectedVoice = voices.find(v => v.name === savedVoice);
          }
          
          // If no saved voice, try to find one matching the language
          if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith(language));
          }
          
          voiceSynthesisRef.current.speak(aiResponse, selectedVoice);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceInput = async () => {
    if (!enhancedVoiceRef.current.isSupported()) {
      toast({
        title: "Not Supported",
        description: "Enhanced voice recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      enhancedVoiceRef.current.stop();
      setIsListening(false);
    } else {
      const success = await enhancedVoiceRef.current.start(
        (transcript) => {
          setInput(transcript);
          setIsListening(false);
        },
        (error) => {
          toast({
            title: "Voice Error",
            description: error,
            variant: "destructive",
          });
          setIsListening(false);
        },
        (clarification) => {
          toast({
            title: "Voice Clarification",
            description: clarification,
          });
        }
      );

      if (success) {
        setIsListening(true);
      } else {
        toast({
          title: "Voice Start Failed",
          description: "Failed to start enhanced voice recognition.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleVoiceOutput = () => {
    if (!voiceSynthesisRef.current.isSupported()) {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (voiceEnabled) {
      voiceSynthesisRef.current.stop();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const toggleVoiceActivation = () => {
    if (!voiceActivationRef.current.isSupported()) {
      toast({
        title: "Not Supported",
        description: "Voice activation is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    if (voiceActivationEnabled) {
      voiceActivationRef.current.stop();
      setVoiceActivationEnabled(false);
      setIsWakeWordListening(false);
      setIsActivated(false);
    } else {
      setVoiceActivationEnabled(true);
      setIsWakeWordListening(true);
      
      voiceActivationRef.current.setSpeechHandlers(
        (transcript) => {
          setInput(transcript);
          handleSend(transcript);
        },
        (error) => {
          toast({
            title: "Voice Error",
            description: error,
            variant: "destructive",
          });
        }
      );

      voiceActivationRef.current.startWakeWordDetection(
        () => {
          setIsActivated(true);
          toast({
            title: "Voice Activated",
            description: "Say 'Hey Mento' to start talking!",
          });
        },
        (error) => {
          toast({
            title: "Voice Error",
            description: error,
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleEmergency = async () => {
    setEmergencyMode(true);
    setAlarmPlaying(true);
    
    // Start the emergency alarm
    if (emergencyAlarmRef.current.isSupported()) {
      emergencyAlarmRef.current.startAlarm();
    }
    
    // Start location tracking
    emergencyServiceRef.current.startLocationTracking();
    
    // Speak emergency message
    if (voiceSynthesisRef.current.isSupported()) {
      voiceSynthesisRef.current.speak("Emergency mode activated. Calling emergency services and contacting your emergency contacts. Alarm will sound for one minute.");
    }

    // Show emergency UI
    toast({
      title: "EMERGENCY MODE ACTIVATED",
      description: "Emergency services contacted. Alarm will sound for 1 minute.",
      variant: "destructive",
    });

    try {
      // Send direct emergency alert to personnel
      await emergencyAlertRef.current.sendDirectEmergencyAlert(
        'general',
        'Emergency detected via shake gesture - immediate assistance required'
      );
      
      // Call emergency services
      await emergencyServiceRef.current.callEmergencyServices();
      
      // Send emergency message to contacts
      await emergencyServiceRef.current.sendEmergencyMessage(EMERGENCY_MESSAGES.GENERAL);
      
      // Send emergency email to contacts with email
      await emergencyServiceRef.current.sendEmergencyEmail(
        "EMERGENCY ALERT - Immediate Assistance Needed",
        "This is an automated emergency alert. I need immediate assistance. Please contact me or emergency services."
      );
      
      toast({
        title: "Emergency Alert Sent",
        description: "Direct alert sent to emergency personnel, services called, and contacts notified.",
      });
      
    } catch (error) {
      console.error('Emergency contact error:', error);
      toast({
        title: "Emergency Alert Error",
        description: "Emergency services called, but there was an issue with the alert system.",
        variant: "destructive",
      });
    }
    
    // Auto-stop alarm and emergency mode after 1 minute
    setTimeout(() => {
      emergencyAlarmRef.current.stopAlarm();
      setAlarmPlaying(false);
      setEmergencyMode(false);
      emergencyServiceRef.current.stopLocationTracking();
      toast({
        title: "Emergency Mode Deactivated",
        description: "Emergency services have been contacted. Alarm stopped.",
      });
    }, 60000); // 1 minute
  };

  const stopAlarm = () => {
    if (emergencyAlarmRef.current.isAlarmPlaying()) {
      emergencyAlarmRef.current.stopAlarm();
      setAlarmPlaying(false);
      toast({
        title: "Alarm Stopped",
        description: "Emergency alarm has been manually stopped.",
      });
    }
  };

  const sendToMentorshipAI = async (message: string) => {
    // This is the function that gets called when voice activation detects speech
    const sanitizedMessage = sanitizeInput(message);
    
    if (detectPromptInjection(sanitizedMessage)) {
      toast({
        title: "Security Warning",
        description: "Your message contains potentially unsafe content. Please rephrase.",
        variant: "destructive",
      });
      return;
    }

    setMessages(prev => [...prev, { role: 'user', content: sanitizedMessage }]);
    setLoading(true);

    try {
      const language = localStorage.getItem("language") || "en";
      
      const { data, error } = await supabase.functions.invoke('mentor-chat', {
        body: { 
          messages: [...messages, { role: 'user', content: sanitizedMessage }],
          language: language,
          persona: PERSONAS[persona]
        }
      });

      if (error) {
        throw error;
      }

      if (data?.content) {
        const aiResponse = data.content;
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: aiResponse
        }]);

        // Always speak the response when using voice activation
        if (voiceSynthesisRef.current.isSupported()) {
          const savedVoice = localStorage.getItem("ai-voice");
          const voices = voiceSynthesisRef.current.getVoices();
          
          let selectedVoice: SpeechSynthesisVoice | undefined;
          
          if (savedVoice && savedVoice !== "default") {
            selectedVoice = voices.find(v => v.name === savedVoice);
          }
          
          if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith(language));
          }
          
          voiceSynthesisRef.current.speak(aiResponse, selectedVoice);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">AI Mentor</h1>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
          
          <div className="ml-auto flex gap-2 items-center">
            <select
              value={persona}
              onChange={(e) => {
                const key = e.target.value as PersonaKey;
                setPersona(key);
                localStorage.setItem("mentor-persona", key);
                toast({
                  title: `${PERSONAS[key].emoji} ${PERSONAS[key].displayName}`,
                  description: `Persona set: ${PERSONAS[key].shortTagline}`,
                });
              }}
              className="text-sm border rounded-md px-2 py-1"
            >
              {Object.values(PERSONAS).map((p) => (
                <option key={p.key} value={p.key}>
                  {p.emoji} {p.displayName}
                </option>
              ))}
            </select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/emergency-contacts')}
            >
              <Shield className="w-4 h-4 mr-2" />
              Contacts
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/emergency-alert')}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alert
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/safety-monitoring')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              Safety
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/voice-settings')}
              className="border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {messages.length === 0 ? (
            <div className="space-y-8">
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-primary)]">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-3">
                  {userName ? `Hi ${userName}! I'm your AI Mentor 👋` : "Welcome to Your AI Mentor"}
                </h2>
                <p className="text-lg text-muted-foreground mb-2">
                  I'm here to guide you through life, fitness, finance, and wellness
                </p>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Powered by advanced AI • Voice-enabled • Always learning
                </p>
              </div>

              {showQuickActions && (
                <div className="space-y-4">
                  <h3 className="text-center text-sm font-medium text-muted-foreground">Quick Start - Choose an area:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <Card 
                          key={action.label}
                          className="cursor-pointer hover:shadow-[var(--shadow-primary)] transition-all duration-300 bg-[image:var(--gradient-card)]"
                          onClick={() => handleQuickAction(action.prompt)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl bg-${action.color}/10 flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-6 h-6 text-${action.color}`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{action.label}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{action.prompt}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate('/settings')}
                      className="gap-2"
                    >
                      <User className="w-4 h-4" />
                      Add your bio info for personalized advice
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[80%] p-4 ${
                    message.role === 'user' 
                      ? 'bg-[image:var(--gradient-primary)] text-white' 
                      : 'bg-muted'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </Card>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <Card className="max-w-[80%] p-4 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Emergency Mode Overlay */}
      {emergencyMode && (
        <div className="fixed inset-0 bg-red-500/90 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">EMERGENCY MODE</h2>
            <p className="text-lg">Emergency services have been contacted</p>
            <p className="text-sm mt-2">Stay calm and follow instructions</p>
            
            {/* Alarm Status */}
            {alarmPlaying && (
              <div className="mt-6 p-4 bg-red-600/50 rounded-lg border border-red-400">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlarmIcon className="w-6 h-6 animate-pulse" />
                  <span className="font-semibold">ALARM SOUNDING</span>
                </div>
                <p className="text-sm mb-3">Alarm will automatically stop in 1 minute</p>
                <Button 
                  onClick={stopAlarm}
                  variant="outline"
                  className="bg-white/20 border-white/50 text-white hover:bg-white/30"
                >
                  Stop Alarm
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-background">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          {/* Voice Controls */}
          <div className="flex gap-2 items-center mb-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceOutput}
              className={voiceEnabled ? "bg-primary/10" : ""}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <span className="text-xs text-muted-foreground">
              {voiceEnabled ? "Voice responses ON" : "Voice responses OFF"}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceActivation}
              className={voiceActivationEnabled ? "bg-green-500/10 border-green-500" : ""}
            >
              <MicIcon className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {voiceActivationEnabled ? "Voice activation ON" : "Voice activation OFF"}
            </span>

            {/* Voice Status Indicators */}
            {voiceActivationEnabled && (
              <div className="flex items-center gap-2">
                {isWakeWordListening && (
                  <div className="flex items-center gap-1 text-xs text-blue-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Listening for "Hey Mento"</span>
                  </div>
                )}
                {isActivated && (
                  <div className="flex items-center gap-1 text-xs text-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Activated - Speak now</span>
                  </div>
                )}
              </div>
            )}

            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Protected</span>
            </div>
          </div>

          {/* Emergency Instructions */}
          <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <AlertTriangle className="w-3 h-3" />
              <span>Emergency: Shake phone 3 times quickly to contact emergency services</span>
            </div>
          </div>

          {/* Alarm Status Indicator */}
          {alarmPlaying && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-red-700">
                  <AlarmIcon className="w-3 h-3 animate-pulse" />
                  <span>Emergency alarm is sounding</span>
                </div>
                <Button 
                  onClick={stopAlarm}
                  variant="outline"
                  size="sm"
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Stop Alarm
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={toggleVoiceInput}
              disabled={loading}
              className={isListening ? "bg-red-500/10 animate-pulse" : ""}
            >
              <Mic className={`w-4 h-4 ${isListening ? "text-red-500" : ""}`} />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={
                isListening 
                  ? "Listening..." 
                  : voiceActivationEnabled 
                    ? "Say 'Hey Mento' or type your message..." 
                    : "Type or speak your message..."
              }
              disabled={loading}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-primary)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
