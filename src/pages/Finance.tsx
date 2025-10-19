import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeExpenseTracker } from "@/components/IncomeExpenseTracker";
import { SavingsGoals } from "@/components/SavingsGoals";
import { InvestmentGuidance } from "@/components/InvestmentGuidance";

const Finance = () => {
  const navigate = useNavigate();

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
          <h1 className="text-4xl font-bold mb-2">Financial Mentor</h1>
          <p className="text-xl text-muted-foreground">Take control of your money with smart guidance</p>
        </div>

        <Tabs defaultValue="tracker" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracker">Income & Expenses</TabsTrigger>
            <TabsTrigger value="goals">Savings Goals</TabsTrigger>
            <TabsTrigger value="investment">Investment Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="mt-6">
            <IncomeExpenseTracker />
          </TabsContent>

          <TabsContent value="goals" className="mt-6">
            <SavingsGoals />
          </TabsContent>

          <TabsContent value="investment" className="mt-6">
            <InvestmentGuidance />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Finance;
