import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const affirmationsByCategory = {
  stress: [
    "I am calm and centered in any situation.",
    "I release stress and embrace peace.",
    "I have the power to create calm in my life.",
    "I choose to let go of what I cannot control.",
  ],
  anxiety: [
    "I am safe and secure in this moment.",
    "I trust the process of life.",
    "I breathe in calm and exhale anxiety.",
    "I am stronger than my worries.",
  ],
  sadness: [
    "This too shall pass, and I will be okay.",
    "I am worthy of happiness and joy.",
    "I choose to focus on what brings me peace.",
    "Every day is a new opportunity for joy.",
  ],
  anger: [
    "I release anger and choose peace.",
    "I am in control of my reactions.",
    "I respond with patience and understanding.",
    "I forgive myself and others with ease.",
  ],
  motivation: [
    "I am capable of achieving my goals.",
    "Every step forward is progress.",
    "I have the strength to overcome any challenge.",
    "I believe in my ability to succeed.",
  ],
  confidence: [
    "I am confident in who I am.",
    "I trust my decisions and choices.",
    "I am worthy of all good things.",
    "I embrace my unique qualities.",
  ],
};

export const Affirmations = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customProblem, setCustomProblem] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const { toast } = useToast();

  const getRandomAffirmation = (category: string) => {
    const affirmations = affirmationsByCategory[category as keyof typeof affirmationsByCategory];
    if (affirmations) {
      const random = affirmations[Math.floor(Math.random() * affirmations.length)];
      setAffirmation(random);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    getRandomAffirmation(category);
  };

  const handleRefresh = () => {
    if (selectedCategory) {
      getRandomAffirmation(selectedCategory);
    }
  };

  const handleCustomSubmit = () => {
    if (!customProblem.trim()) {
      toast({
        title: "Please describe what you're feeling",
        variant: "destructive",
      });
      return;
    }

    // Match custom problem to categories
    const problem = customProblem.toLowerCase();
    let category = "motivation";

    if (problem.includes("stress") || problem.includes("overwhelmed")) category = "stress";
    else if (problem.includes("anxious") || problem.includes("worry")) category = "anxiety";
    else if (problem.includes("sad") || problem.includes("down")) category = "sadness";
    else if (problem.includes("angry") || problem.includes("frustrated")) category = "anger";
    else if (problem.includes("confident") || problem.includes("insecure")) category = "confidence";

    setSelectedCategory(category);
    getRandomAffirmation(category);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Daily Affirmations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Choose what you need support with:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.keys(affirmationsByCategory).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => handleCategorySelect(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Or describe what you're feeling:</p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., I'm feeling stressed about work"
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleCustomSubmit()}
              />
              <Button onClick={handleCustomSubmit}>Get Affirmation</Button>
            </div>
          </div>

          {affirmation && (
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-lg font-medium leading-relaxed">{affirmation}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    className="flex-shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
