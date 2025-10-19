import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Home, FileText, Briefcase } from "lucide-react";
import { BigPurchasePlanner } from "@/components/BigPurchasePlanner";
import { ResumeHelper } from "@/components/ResumeHelper";
import { InterviewTips } from "@/components/InterviewTips";

const Skills = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("purchases");

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

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Life Skills</h1>
          <p className="text-xl text-muted-foreground">Master essential skills for success</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="purchases" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Big Purchases
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resume Help
            </TabsTrigger>
            <TabsTrigger value="interview" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Interview Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="purchases">
            <BigPurchasePlanner />
          </TabsContent>

          <TabsContent value="resume">
            <ResumeHelper />
          </TabsContent>

          <TabsContent value="interview">
            <InterviewTips />
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 mt-8">
          <CardHeader>
            <CardTitle>Learn with AI</CardTitle>
            <CardDescription>Get personalized learning assistance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => navigate('/chat')}
            >
              Start Learning
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Skills;
