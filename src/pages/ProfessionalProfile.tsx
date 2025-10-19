import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Star, Award, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const specialtyLabels: Record<string, string> = {
  finance: "Finance",
  mental_wellness: "Mental Wellness",
  life_skills: "Life Skills",
  career: "Career",
  legal: "Legal",
  health: "Health",
  education: "Education",
  technology: "Technology",
  business: "Business"
};

interface Professional {
  id: string;
  display_name: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  years_experience: number;
  certifications: string[] | null;
  average_rating: number;
  total_consultations: number;
  is_verified: boolean;
}

const CheckoutForm = ({ amount, onSuccess }: { amount: number; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/consultation-success`,
      },
    });

    if (error) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full bg-[image:var(--gradient-primary)]">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Pay ${amount.toFixed(2)}
      </Button>
    </form>
  );
};

const ProfessionalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState("60");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfessional();
  }, [id]);

  const fetchProfessional = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProfessional(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate('/professionals');
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-consultation-payment', {
        body: {
          professionalId: id,
          durationMinutes: parseInt(duration)
        }
      });

      if (error) throw error;
      
      setClientSecret(data.clientSecret);
      setConsultationId(data.consultationId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!professional) {
    return null;
  }

  const totalCost = (professional.hourly_rate * parseInt(duration)) / 60;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/professionals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Professionals
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="bg-[image:var(--gradient-card)]">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-2 mb-2">
                  {professional.display_name}
                  {professional.is_verified && (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 fill-accent text-accent mr-1" />
                    <span className="font-medium">{professional.average_rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {professional.total_consultations} consultations
                  </span>
                  <span className="text-muted-foreground">
                    {professional.years_experience} years experience
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  ${professional.hourly_rate}
                </div>
                <div className="text-sm text-muted-foreground">per hour</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {professional.specialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-sm">
                  {specialtyLabels[specialty]}
                </Badge>
              ))}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">About</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{professional.bio}</p>
            </div>

            {professional.certifications && professional.certifications.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Certifications
                  </h3>
                  <ul className="space-y-2">
                    {professional.certifications.map((cert, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            <div>
              <h3 className="text-xl font-semibold mb-4">Book a Consultation</h3>
              
              <Dialog>
                <DialogTrigger asChild>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Session Duration</label>
                        <Select value={duration} onValueChange={setDuration}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes - ${((professional.hourly_rate * 30) / 60).toFixed(2)}</SelectItem>
                            <SelectItem value="60">1 hour - ${professional.hourly_rate.toFixed(2)}</SelectItem>
                            <SelectItem value="90">1.5 hours - ${((professional.hourly_rate * 90) / 60).toFixed(2)}</SelectItem>
                            <SelectItem value="120">2 hours - ${(professional.hourly_rate * 2).toFixed(2)}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-[image:var(--gradient-primary)]" size="lg">
                      Book Now - ${totalCost.toFixed(2)}
                    </Button>
                  </div>
                </DialogTrigger>
                
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Complete Your Booking</DialogTitle>
                    <DialogDescription>
                      {duration} minute consultation with {professional.display_name}
                    </DialogDescription>
                  </DialogHeader>
                  
                  {!clientSecret ? (
                    <Button onClick={initiatePayment} className="w-full bg-[image:var(--gradient-primary)]">
                      Proceed to Payment
                    </Button>
                  ) : (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <CheckoutForm 
                        amount={totalCost}
                        onSuccess={() => navigate(`/consultation/${consultationId}`)}
                      />
                    </Elements>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProfessionalProfile;
