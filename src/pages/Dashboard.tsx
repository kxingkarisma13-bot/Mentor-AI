import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Brain, DollarSign, Heart, GraduationCap, LogOut, MessageSquare, Dumbbell, TrendingUp, Settings, BookOpen, Sparkles, Shield, AlertTriangle, Activity, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NotificationService } from "@/utils/notificationService";
import { DailyInspirationDialog } from "@/components/DailyInspirationDialog";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [greeting, setGreeting] = useState<string>("");
  const [todayInspiration, setTodayInspiration] = useState<{
    type: string;
    content: string;
    reference?: string;
  } | null>(null);
  const [showInspirationDialog, setShowInspirationDialog] = useState(false);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 21) return "Good Evening";
    return "Good Night";
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      } else {
        setUserEmail(session.user.email || "");
        
        // Try to get username from profile, fallback to email
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
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
          setUserName(formattedName);
        }
        
        setGreeting(getTimeBasedGreeting());
      }
    };

    checkAuth();
    
    // Load today's inspiration
    const stored = localStorage.getItem("todayInspiration");
    if (stored) {
      setTodayInspiration(JSON.parse(stored));
    }
    
    // Initialize notifications
    if (NotificationService.hasPermission()) {
      NotificationService.scheduleDaily();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUserEmail(session.user.email || "");
        
        // Try to get username from profile
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
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
          setUserName(formattedName);
        }
        
        setGreeting(getTimeBasedGreeting());
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
    navigate('/');
  };

  const features = [
    {
      title: "AI Chat",
      description: "Talk to your personal AI mentor with voice",
      icon: MessageSquare,
      color: "primary",
      path: "/chat",
    },
    {
      title: "Fitness & Workouts",
      description: "Get personalized fitness plans and tracking",
      icon: Dumbbell,
      color: "accent",
      path: "/fitness",
    },
    {
      title: "Progress Tracker",
      description: "Track goals across all areas of life",
      icon: TrendingUp,
      color: "secondary",
      path: "/progress",
    },
    {
      title: "Expert Professionals",
      description: "Connect with verified mentors",
      icon: Brain,
      color: "secondary",
      path: "/professionals",
    },
    {
      title: "Financial Mentor",
      description: "Budget planning and money management",
      icon: DollarSign,
      color: "primary",
      path: "/finance",
    },
    {
      title: "Mental Wellness",
      description: "Daily support and coping strategies",
      icon: Heart,
      color: "secondary",
      path: "/wellness",
    },
    {
      title: "Life Skills",
      description: "Learn real-world adulting skills",
      icon: GraduationCap,
      color: "accent",
      path: "/skills",
    },
    {
      title: "Emergency Contacts",
      description: "Manage your emergency contacts",
      icon: Shield,
      color: "destructive",
      path: "/emergency-contacts",
    },
    {
      title: "Emergency Alert",
      description: "Send direct alert to emergency personnel",
      icon: AlertTriangle,
      color: "destructive",
      path: "/emergency-alert",
    },
    {
      title: "Safety Monitoring",
      description: "Continuous distress detection and monitoring",
      icon: Activity,
      color: "secondary",
      path: "/safety-monitoring",
    },
    {
      title: "Voice Settings",
      description: "Advanced voice processing and sensitivity controls",
      icon: Mic,
      color: "accent",
      path: "/voice-settings",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <DailyInspirationDialog 
        onClose={(inspiration) => setTodayInspiration(inspiration)} 
        manualOpen={showInspirationDialog}
        onOpenChange={setShowInspirationDialog}
      />
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Mentor AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">{greeting}, {userName}! 👋</h1>
          <p className="text-xl text-muted-foreground mb-6">
            What would you like to work on today?
          </p>
          
          {/* Daily Inspiration Display */}
          <div className="flex gap-4 items-start">
            {todayInspiration && (
              <div className="flex-1 mt-6 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {todayInspiration.type === "verse" && <BookOpen className="w-5 h-5 text-primary" />}
                    {todayInspiration.type === "prayer" && <Heart className="w-5 h-5 text-primary" />}
                    {todayInspiration.type === "quote" && <Sparkles className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-primary mb-1">
                      {todayInspiration.type === "verse" && "Today's Bible Verse"}
                      {todayInspiration.type === "prayer" && "Prayer for Today"}
                      {todayInspiration.type === "quote" && "Daily Motivation"}
                    </p>
                    <p className="text-foreground italic leading-relaxed">
                      "{todayInspiration.content}"
                    </p>
                    {todayInspiration.reference && (
                      <p className="text-sm text-muted-foreground mt-2">
                        — {todayInspiration.reference}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setShowInspirationDialog(true)}
              className="gap-2 shrink-0 mt-6"
            >
              <Sparkles className="w-5 h-5" />
              Get Inspired
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
          <Card 
            key={feature.title}
            className="cursor-pointer hover:shadow-[var(--shadow-primary)] transition-all duration-300 bg-[image:var(--gradient-card)]"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              navigate(feature.path);
            }}
          >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-2`}>
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full bg-[image:var(--gradient-primary)]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(feature.path);
                    }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Conversations</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-accent">0</p>
            <p className="text-sm text-muted-foreground">Goals Achieved</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-secondary">0</p>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Skills Learned</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
