import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2, AlertCircle, ShieldCheck, Lock, Key } from "lucide-react";
import { authFormSchema, passwordSchema, logSecurityEvent } from "@/utils/validation";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    setLoading(true);

    try {
      // Validate input
      const validationResult = authFormSchema.safeParse({ email, password });
      
      if (!validationResult.success) {
        const errors: { email?: string; password?: string } = {};
        validationResult.error.errors.forEach((err) => {
          if (err.path[0] === 'email') errors.email = err.message;
          if (err.path[0] === 'password') errors.password = err.message;
        });
        setValidationErrors(errors);
        return;
      }

      if (isLogin) {
        logSecurityEvent({
          event_type: 'login_attempt',
          details: { email },
        });

        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          logSecurityEvent({
            event_type: 'login_failure',
            details: { email, reason: 'invalid_credentials' },
          });
          
          // Don't expose specific error details for security
          if (error.message.includes('Invalid') || error.message.includes('credentials')) {
            throw new Error('Invalid email or password');
          }
          throw error;
        }

        logSecurityEvent({
          event_type: 'login_success',
          details: { email },
        });

        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        logSecurityEvent({
          event_type: 'registration',
          details: { email },
        });

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          // Handle specific signup errors
          if (error.message.includes('already registered')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw error;
        }

        toast({
          title: "Account created!",
          description: "Welcome to Mentor AI. Let's get started!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-5" />
      
      <Card className="w-full max-w-md relative">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-[image:var(--gradient-primary)] flex items-center justify-center mb-2">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Sign in to continue your growth journey" 
              : "Start your personalized growth journey today"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationErrors(prev => ({ ...prev, email: undefined }));
                }}
                required
                className={validationErrors.email ? "border-destructive" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setValidationErrors(prev => ({ ...prev, password: undefined }));
                }}
                required
                className={validationErrors.password ? "border-destructive" : ""}
              />
              {validationErrors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {validationErrors.password}
                </p>
              )}
              {!isLogin && !validationErrors.password && (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    Must be 12+ characters with uppercase, lowercase, number, and special character
                  </p>
                  <Alert className="mt-2">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      <strong>Password Security Tips:</strong>
                      <ul className="mt-1 space-y-1 list-disc list-inside">
                        <li>Use a unique password for this account</li>
                        <li>Consider using a password manager</li>
                        <li>Avoid personal information (name, birthdate)</li>
                        <li>Enable 2FA for enhanced security</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>

            <Button
              type="submit" 
              className="w-full bg-[image:var(--gradient-primary)] hover:shadow-[var(--shadow-primary)]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                isLogin ? "Sign In" : "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
