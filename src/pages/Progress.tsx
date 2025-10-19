import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Target, TrendingUp, Calendar, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Goal {
  id: string;
  category: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  status: string;
  created_at: string;
}

const Progress = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newGoal, setNewGoal] = useState({
    category: "",
    title: "",
    description: "",
    target_value: "",
    unit: "",
    target_date: "",
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateGoal = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_goals')
        .insert({
          user_id: user.id,
          category: newGoal.category,
          title: newGoal.title,
          description: newGoal.description,
          target_value: parseFloat(newGoal.target_value),
          unit: newGoal.unit,
          target_date: newGoal.target_date || null,
          current_value: 0,
          status: 'active',
        });

      if (error) throw error;

      toast({
        title: "Goal Created",
        description: "Your new goal has been added!",
      });

      setIsDialogOpen(false);
      setNewGoal({
        category: "",
        title: "",
        description: "",
        target_value: "",
        unit: "",
        target_date: "",
      });
      loadGoals();
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

  const updateProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const { error: updateError } = await supabase
        .from('user_goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (updateError) throw updateError;

      const { error: progressError } = await supabase
        .from('goal_progress')
        .insert({
          goal_id: goalId,
          value: newValue,
        });

      if (progressError) throw progressError;

      toast({
        title: "Progress Updated",
        description: "Keep up the great work!",
      });

      loadGoals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fitness': return <Flame className="w-5 h-5" />;
      case 'finance': return <TrendingUp className="w-5 h-5" />;
      case 'wellness': return <Target className="w-5 h-5" />;
      case 'skills': return <Calendar className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fitness': return 'text-red-500';
      case 'finance': return 'text-green-500';
      case 'wellness': return 'text-purple-500';
      case 'skills': return 'text-blue-500';
      default: return 'text-primary';
    }
  };

  const getProgressPercentage = (goal: Goal) => {
    if (!goal.target_value) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[image:var(--gradient-primary)]">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>Set a new goal to track your progress</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="wellness">Wellness</SelectItem>
                      <SelectItem value="skills">Life Skills</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Run 100 kilometers"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Optional details"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      value={newGoal.target_value}
                      onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
                      placeholder="km, $, days"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Target Date (Optional)</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal({ ...newGoal, target_date: e.target.value })}
                  />
                </div>

                <Button onClick={handleCreateGoal} disabled={loading} className="w-full">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Progress Tracker</h1>
          <p className="text-xl text-muted-foreground">Track your goals across all areas of life</p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-500">
                  {goals.filter(g => g.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-500">
                  {goals.filter(g => g.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">
                  {Math.round(goals.reduce((acc, g) => acc + getProgressPercentage(g), 0) / (goals.length || 1))}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        {goals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">Create your first goal to start tracking progress!</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-[image:var(--gradient-primary)]">
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={getCategoryColor(goal.category)}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <CardDescription>{goal.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </p>
                      {goal.target_date && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(goal.target_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <ProgressBar value={getProgressPercentage(goal)} className="h-3" />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Update progress"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseFloat((e.target as HTMLInputElement).value);
                            if (!isNaN(value)) {
                              updateProgress(goal.id, value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(getProgressPercentage(goal))}% complete
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Progress;
