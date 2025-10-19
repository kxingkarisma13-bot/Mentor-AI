import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { professionalRegistrationSchema, sanitizeInput, logSecurityEvent } from "@/utils/validation";

const specialtyOptions = [
  { value: 'finance', label: 'Finance' },
  { value: 'mental_wellness', label: 'Mental Wellness' },
  { value: 'life_skills', label: 'Life Skills' },
  { value: 'career', label: 'Career' },
  { value: 'legal', label: 'Legal' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' }
];

const BecomeProfessional = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    display_name: "",
    bio: "",
    specialties: [] as string[],
    hourly_rate: "",
    years_experience: "",
    certifications: ""
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUserId(session.user.id);
        
        // Check if already a professional
        const { data: existing } = await supabase
          .from('professionals')
          .select('id')
          .eq('user_id', session.user.id)
          .single();
        
        if (existing) {
          toast({
            title: "Already registered",
            description: "You're already registered as a professional!",
          });
          navigate('/dashboard');
        }
      }
    };
    checkAuth();
  }, [navigate, toast]);

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse certifications
      const certArray = formData.certifications
        .split(',')
        .map(c => sanitizeInput(c.trim()))
        .filter(c => c.length > 0);

      // Prepare data for validation
      const validationData = {
        display_name: formData.display_name.trim(),
        bio: formData.bio.trim(),
        specialties: formData.specialties,
        hourly_rate: parseFloat(formData.hourly_rate),
        years_experience: parseInt(formData.years_experience),
        certifications: certArray,
      };

      // Validate input
      const validationResult = professionalRegistrationSchema.safeParse(validationData);
      
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        
        logSecurityEvent({
          event_type: 'validation_failure',
          user_id: userId,
          details: {
            form: 'professional_registration',
            errors: validationResult.error.errors.map(e => e.message),
          },
        });
        return;
      }

      // Sanitize text inputs
      const sanitizedData = {
        user_id: userId,
        display_name: sanitizeInput(validationData.display_name),
        bio: sanitizeInput(validationData.bio),
        specialties: validationData.specialties,
        hourly_rate: validationData.hourly_rate,
        years_experience: validationData.years_experience,
        certifications: certArray.length > 0 ? certArray : null,
      };

      const { error } = await supabase
        .from('professionals')
        .insert([sanitizedData] as any);

      if (error) throw error;

      logSecurityEvent({
        event_type: 'professional_registration',
        user_id: userId,
        details: {
          specialties: validationData.specialties,
          years_experience: validationData.years_experience,
        },
      });

      toast({
        title: "Success!",
        description: "Your professional profile has been created and is pending verification.",
      });
      navigate('/professionals');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      logSecurityEvent({
        event_type: 'professional_registration',
        user_id: userId,
        details: { error: error.message, success: false },
      });
    } finally {
      setLoading(false);
    }
  };

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

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-[image:var(--gradient-card)]">
          <CardHeader>
            <CardTitle className="text-3xl">Become a Professional</CardTitle>
            <CardDescription>
              Share your expertise and help others grow. Set your own rates and schedule.
            </CardDescription>
            
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                All professional profiles undergo verification before accepting consultations. Please provide accurate information and valid certifications.
              </AlertDescription>
            </Alert>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name *</Label>
                <Input
                  id="display_name"
                  required
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="How should clients see you?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  required
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your experience and what you can help with..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters. Describe your expertise, experience, and how you can help clients.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Specialties * (Select at least one)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {specialtyOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={formData.specialties.includes(option.value)}
                        onCheckedChange={() => handleSpecialtyToggle(option.value)}
                      />
                      <label htmlFor={option.value} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hourly_rate">Hourly Rate (USD) *</Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    placeholder="50.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="years_experience">Years of Experience *</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    required
                    value={formData.years_experience}
                    onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (Optional)</Label>
                <Input
                  id="certifications"
                  value={formData.certifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                  placeholder="Separate multiple certifications with commas"
                />
                <p className="text-sm text-muted-foreground">
                  Example: CPA, CFP, MBA
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[image:var(--gradient-primary)]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  "Create Professional Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BecomeProfessional;
