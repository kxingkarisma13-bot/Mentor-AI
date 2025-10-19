import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, DollarSign, Heart, GraduationCap, Sparkles, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-mentor-ai.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Your AI-Powered Growth Partner</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight">
              Transform Your Life with{" "}
              <span className="bg-clip-text text-transparent bg-[image:var(--gradient-hero)]">
                Mentor AI
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your personal guide for financial wisdom, mental wellness, and life skills. 
              Get instant AI-powered advice, track your progress, and grow with a supportive community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-[image:var(--gradient-primary)] hover:shadow-[var(--shadow-primary)] transition-all duration-300"
                onClick={() => navigate('/auth')}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-primary/20 hover:bg-primary/5"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Thrive</h2>
            <p className="text-xl text-muted-foreground">AI-powered tools for every aspect of your personal growth</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-[image:var(--gradient-card)] border-primary/20 hover:shadow-[var(--shadow-primary)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Financial Mentor</h3>
              <p className="text-muted-foreground">Smart budgeting, savings goals, and investment guidance tailored to your situation.</p>
            </Card>
            
            <Card className="p-6 bg-[image:var(--gradient-card)] border-secondary/20 hover:shadow-[var(--shadow-secondary)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mental Wellness</h3>
              <p className="text-muted-foreground">Daily affirmations, coping strategies, and emotional support when you need it.</p>
            </Card>
            
            <Card className="p-6 bg-[image:var(--gradient-card)] border-accent/20 hover:shadow-[var(--shadow-primary)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Life Skills</h3>
              <p className="text-muted-foreground">Step-by-step guides for taxes, banking, career, and everyday adulting.</p>
            </Card>
            
            <Card className="p-6 bg-[image:var(--gradient-card)] border-primary/20 hover:shadow-[var(--shadow-primary)] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Chat</h3>
              <p className="text-muted-foreground">Have natural conversations with AI that truly understands your needs.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Built for Everyone</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Accessible Design</h3>
                    <p className="text-muted-foreground">Large buttons, voice input, and simple language make it easy for everyone to use.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Your Privacy Matters</h3>
                    <p className="text-muted-foreground">End-to-end encryption keeps your personal information safe and secure.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Personalized Growth</h3>
                    <p className="text-muted-foreground">AI learns your goals and adapts advice to fit your unique journey.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-[image:var(--gradient-hero)] opacity-20 rounded-3xl blur-3xl" />
              <Card className="relative p-8 bg-[image:var(--gradient-card)] border-primary/20">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                    <span className="text-muted-foreground">AI is analyzing your goals...</span>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <p className="font-medium">💡 Based on your income, I recommend saving $200/month. Let's start with a simple budget!</p>
                  </div>
                  <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
                    <p className="font-medium">🧘 Feeling stressed? Try this 2-minute breathing exercise...</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[image:var(--gradient-hero)] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Your Growth Journey Today</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of people transforming their lives with personalized AI guidance.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => navigate('/auth')}
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Mentor AI. Your trusted companion for personal growth.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
