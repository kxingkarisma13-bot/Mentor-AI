import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Send, ArrowLeft, Loader2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { chatMessageSchema, sanitizeInput, checkRateLimit } from "@/utils/validation";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface Consultation {
  id: string;
  status: string;
  professional_id: string;
  user_id: string;
  duration_minutes: number;
  professionals: {
    display_name: string;
  };
}

const ConsultationChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setCurrentUserId(session.user.id);

      // Fetch consultation details
      const { data: consultData, error: consultError } = await supabase
        .from('consultations')
        .select('*, professionals(display_name)')
        .eq('id', id)
        .single();

      if (consultError) throw consultError;
      setConsultation(consultData as any);

      // Fetch messages
      const { data: msgData, error: msgError } = await supabase
        .from('consultation_messages')
        .select('*')
        .eq('consultation_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;
      setMessages(msgData || []);

      // Subscribe to real-time messages
      const channel = supabase
        .channel(`consultation:${id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'consultation_messages',
            filter: `consultation_id=eq.${id}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Error",
        description: "Failed to load consultation. Please try again.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !currentUserId) return;

    // Validate message
    const validationResult = chatMessageSchema.safeParse({ content: input.trim() });
    if (!validationResult.success) {
      toast({
        title: "Invalid Message",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Check rate limit (10 messages per minute)
    const rateLimitCheck = checkRateLimit(`consultation_${id}_${currentUserId}`, 10, 60000);
    if (!rateLimitCheck.allowed) {
      toast({
        title: "Too Many Messages",
        description: `Please wait ${Math.ceil((rateLimitCheck.retryAfter || 0) / 1000)} seconds before sending another message.`,
        variant: "destructive",
      });
      return;
    }

    // Sanitize message content
    const messageContent = sanitizeInput(input.trim());
    setInput("");
    setLoading(true);

    try {
      const { error } = await supabase
        .from('consultation_messages')
        .insert([{
          consultation_id: id,
          sender_id: currentUserId,
          content: messageContent
        }] as any);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!consultation) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const isProfessional = currentUserId !== consultation.user_id;
  const otherPartyName = consultation.professionals?.display_name || "Professional";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <span className="font-semibold">{otherPartyName}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={consultation.status === 'active' ? 'default' : 'secondary'}>
                  {consultation.status}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {consultation.duration_minutes} min session
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-[image:var(--gradient-primary)] flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Start Your Consultation</h2>
              <p className="text-muted-foreground">
                Introduce yourself and share what you'd like help with today.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <Card className={`max-w-[80%] p-4 ${
                    message.sender_id === currentUserId 
                      ? 'bg-[image:var(--gradient-primary)] text-white' 
                      : 'bg-muted'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.sender_id === currentUserId ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </Card>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={loading || consultation.status === 'completed'}
              className="flex-1"
            />
            <Button 
              onClick={handleSend}
              disabled={loading || !input.trim() || consultation.status === 'completed'}
              className="bg-[image:var(--gradient-primary)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          {consultation.status === 'completed' && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              This consultation has ended. Thank you!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationChat;
