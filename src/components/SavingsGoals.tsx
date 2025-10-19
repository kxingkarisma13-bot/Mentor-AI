import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Target, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  monthly_contribution: number | null;
  description: string | null;
  status: string;
}

export const SavingsGoals = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load goals", variant: "destructive" });
    } else {
      setGoals(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !targetAmount) {
      toast({ title: "Error", description: "Please fill required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "Please sign in", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: user.id,
        title,
        target_amount: parseFloat(targetAmount),
        current_amount: currentAmount ? parseFloat(currentAmount) : 0,
        target_date: targetDate || null,
        monthly_contribution: monthlyContribution ? parseFloat(monthlyContribution) : null,
        description: description || null,
      });

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to create goal", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Savings goal created!" });
      setOpen(false);
      setTitle("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
      setMonthlyContribution("");
      setDescription("");
      fetchGoals();
    }
  };

  const handleUpdateProgress = async (goalId: string, newAmount: string) => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) return;

    const { error } = await supabase
      .from('savings_goals')
      .update({ current_amount: amount })
      .eq('id', goalId);

    if (error) {
      toast({ title: "Error", description: "Failed to update progress", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Progress updated!" });
      fetchGoals();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete goal", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Goal deleted" });
      fetchGoals();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Savings Goals</h2>
          <p className="text-muted-foreground">Set and track your financial goals</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
              <DialogDescription>Set a new savings target to work towards</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input
                  placeholder="Emergency Fund"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Current Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Monthly Contribution</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="500"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Build 6 months of expenses"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                Create Goal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No savings goals yet. Create one to get started!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          goals.map(goal => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const remaining = goal.target_amount - goal.current_amount;
            const monthsToTarget = goal.target_date 
              ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))
              : null;

            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{goal.title}</CardTitle>
                      <CardDescription>{goal.description}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Current</p>
                      <p className="text-xl font-bold">${goal.current_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Target</p>
                      <p className="text-xl font-bold">${goal.target_amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-medium">${remaining.toFixed(2)}</span>
                    </div>
                    {goal.monthly_contribution && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Contribution</span>
                        <span className="font-medium">${goal.monthly_contribution.toFixed(2)}</span>
                      </div>
                    )}
                    {goal.target_date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target Date</span>
                        <span className="font-medium">
                          {new Date(goal.target_date).toLocaleDateString()}
                          {monthsToTarget && monthsToTarget > 0 && ` (${monthsToTarget} months)`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Update amount"
                      defaultValue={goal.current_amount}
                      onBlur={(e) => handleUpdateProgress(goal.id, e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
