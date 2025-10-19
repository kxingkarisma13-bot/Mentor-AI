import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Brain, ArrowLeft, Star, Search, DollarSign, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Professional {
  id: string;
  display_name: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  years_experience: number;
  average_rating: number;
  total_consultations: number;
  is_verified: boolean;
}

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

const Professionals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProfessionals = professionals.filter(prof => {
    const matchesSearch = prof.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prof.bio.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || 
                            prof.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-semibold">Professional Marketplace</span>
          </div>
          <Button onClick={() => navigate('/become-professional')}>
            Become a Professional
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Connect with Expert Mentors</h1>
          <p className="text-xl text-muted-foreground">
            Get personalized guidance from verified professionals
          </p>
        </div>

        {/* Search and Filter */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search professionals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {Object.entries(specialtyLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Professionals Grid */}
        {loading ? (
          <div className="text-center py-12">Loading professionals...</div>
        ) : filteredProfessionals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No professionals found. Be the first to join!</p>
              <Button className="mt-4" onClick={() => navigate('/become-professional')}>
                Become a Professional
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessionals.map((prof) => (
              <Card 
                key={prof.id}
                className="cursor-pointer hover:shadow-[var(--shadow-primary)] transition-all duration-300 bg-[image:var(--gradient-card)]"
                onClick={() => navigate(`/professional/${prof.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {prof.display_name}
                        {prof.is_verified && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-accent text-accent mr-1" />
                          <span className="text-sm font-medium">{prof.average_rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({prof.total_consultations} sessions)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <CardDescription className="line-clamp-2">
                    {prof.bio}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {prof.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialtyLabels[specialty]}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {prof.hourly_rate}/hr
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {prof.years_experience} yrs exp
                    </span>
                  </div>
                  
                  <Button className="w-full mt-4 bg-[image:var(--gradient-primary)]">
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Professionals;
