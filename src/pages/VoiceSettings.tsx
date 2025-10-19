import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, Volume2, Settings, TestTube, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdvancedVoiceProcessor, VoiceSettings } from "@/utils/voiceProcessor";

const VoiceSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [voiceProcessor] = useState<AdvancedVoiceProcessor>(new AdvancedVoiceProcessor());
  const [settings, setSettings] = useState<VoiceSettings>({
    decibelThreshold: 60,
    confidenceThreshold: 0.8,
    noiseReduction: true,
    wakeWordRequired: true,
    intentDetection: true,
    clarificationEnabled: true
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    decibelLevel: number;
    confidence: number;
    isSpeech: boolean;
    isIntentional: boolean;
  } | null>(null);

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('voice-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        voiceProcessor.updateSettings(parsed);
      } catch (error) {
        console.error('Failed to load voice settings:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem('voice-settings', JSON.stringify(settings));
      voiceProcessor.updateSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Voice processing settings have been updated.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save voice settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const testVoiceProcessing = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const initialized = await voiceProcessor.initializeAudio();
      if (!initialized) {
        throw new Error('Failed to initialize audio');
      }

      // Start test processing
      voiceProcessor.startProcessing(
        (analysis) => {
          setTestResults({
            decibelLevel: analysis.decibelLevel,
            confidence: analysis.confidence,
            isSpeech: analysis.isSpeech,
            isIntentional: analysis.isIntentional
          });
        },
        (message) => {
          toast({
            title: "Clarification Needed",
            description: message,
          });
        }
      );

      // Stop after 10 seconds
      setTimeout(() => {
        voiceProcessor.stopProcessing();
        setIsTesting(false);
      }, 10000);

      toast({
        title: "Voice Test Started",
        description: "Speak normally for 10 seconds to test voice processing.",
      });
    } catch (error) {
      setIsTesting(false);
      toast({
        title: "Test Failed",
        description: "Failed to start voice test. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const resetToDefaults = () => {
    const defaultSettings: VoiceSettings = {
      decibelThreshold: 60,
      confidenceThreshold: 0.8,
      noiseReduction: true,
      wakeWordRequired: true,
      intentDetection: true,
      clarificationEnabled: true
    };
    setSettings(defaultSettings);
    voiceProcessor.updateSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "Voice settings have been reset to defaults.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Voice Settings</h1>
              <p className="text-xs text-muted-foreground">Advanced voice processing controls</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Voice Sensitivity Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Voice Sensitivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Decibel Threshold */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Decibel Threshold: {settings.decibelThreshold} dB
              </label>
              <input
                type="range"
                min="30"
                max="90"
                value={settings.decibelThreshold}
                onChange={(e) => setSettings({...settings, decibelThreshold: parseInt(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Whisper (30 dB)</span>
                <span>Normal (60 dB)</span>
                <span>Loud (90 dB)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Only process audio above this volume level to avoid false activations.
              </p>
            </div>

            {/* Confidence Threshold */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Confidence Threshold: {Math.round(settings.confidenceThreshold * 100)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.1"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({...settings, confidenceThreshold: parseFloat(e.target.value)})}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Low (50%)</span>
                <span>High (80%)</span>
                <span>Very High (100%)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Minimum speech recognition confidence required to respond.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Processing Options */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Processing Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Noise Reduction</h4>
                  <p className="text-sm text-muted-foreground">
                    Filter out background noise and non-speech audio
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.noiseReduction}
                  onChange={(e) => setSettings({...settings, noiseReduction: e.target.checked})}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Wake Word Required</h4>
                  <p className="text-sm text-muted-foreground">
                    Only respond when wake words like "Hey Mento" are detected
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.wakeWordRequired}
                  onChange={(e) => setSettings({...settings, wakeWordRequired: e.target.checked})}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Intent Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Analyze speech for clear intent and purpose
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.intentDetection}
                  onChange={(e) => setSettings({...settings, intentDetection: e.target.checked})}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Clarification System</h4>
                  <p className="text-sm text-muted-foreground">
                    Ask for clarification when speech is unclear or ambiguous
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.clarificationEnabled}
                  onChange={(e) => setSettings({...settings, clarificationEnabled: e.target.checked})}
                  className="rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voice Test */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Voice Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test your voice settings to ensure optimal performance and minimal false activations.
            </p>
            
            <Button 
              onClick={testVoiceProcessing}
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? 'Testing... (10 seconds)' : 'Start Voice Test'}
            </Button>

            {testResults && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">Test Results</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Volume: {testResults.decibelLevel.toFixed(1)} dB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Confidence: {Math.round(testResults.confidence * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.isSpeech ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>Speech Detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {testResults.isIntentional ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span>Intentional</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={saveSettings} className="flex-1">
            Save Settings
          </Button>
          <Button onClick={resetToDefaults} variant="outline">
            Reset to Defaults
          </Button>
        </div>

        {/* Information Panel */}
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 mb-2">Voice Processing Information</h4>
                <div className="text-sm text-amber-700 space-y-2">
                  <p><strong>Decibel Threshold:</strong> Only processes audio above this volume to avoid false activations from whispers or background noise.</p>
                  <p><strong>Confidence Threshold:</strong> Requires high speech recognition confidence to ensure clear, intentional speech.</p>
                  <p><strong>Noise Reduction:</strong> Filters out non-speech audio like coughing, breathing, or room noise.</p>
                  <p><strong>Intent Detection:</strong> Analyzes speech for clear purpose and meaning before responding.</p>
                  <p><strong>Clarification System:</strong> Asks for repetition when speech is unclear rather than making assumptions.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default VoiceSettings;



