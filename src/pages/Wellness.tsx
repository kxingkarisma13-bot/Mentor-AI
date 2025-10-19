import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Heart, Smile, Brain } from "lucide-react";
import { MoodTracker } from "@/components/MoodTracker";
import { Affirmations } from "@/components/Affirmations";
import { CopingTools } from "@/components/CopingTools";

const Wellness = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mood");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mental Wellness</h1>
          <p className="text-xl text-muted-foreground">Your emotional health companion</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Mood Tracker
            </TabsTrigger>
            <TabsTrigger value="affirmations" className="flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Affirmations
            </TabsTrigger>
            <TabsTrigger value="coping" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Coping Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood">
            <MoodTracker />
          </TabsContent>

          <TabsContent value="affirmations">
            <Affirmations />
          </TabsContent>

          <TabsContent value="coping">
            <CopingTools />
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 mt-8">
          <CardHeader>
            <CardTitle>Talk to AI</CardTitle>
            <CardDescription>Get emotional support and coping strategies</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => navigate('/chat')}
            >
              Start Wellness Chat
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Wellness;
