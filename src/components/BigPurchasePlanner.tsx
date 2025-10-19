import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Home, Car, GraduationCap, Plane, Plus, TrendingUp } from "lucide-react";

interface PurchasePlan {
  id: string;
  purchase_type: string;
  target_amount: number;
  current_savings: number;
  target_date?: string;
  monthly_budget?: number;
  notes?: string;
}

const purchaseTypes = [
  { value: "home", label: "Home", icon: Home },
  { value: "car", label: "Car", icon: Car },
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "vacation", label: "Vacation", icon: Plane },
];

export const BigPurchasePlanner = () => {
  const [plans, setPlans] = useState<PurchasePlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    purchase_type: "",
    target_amount: "",
    current_savings: "",
    target_date: "",
    monthly_budget: "",
    notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("big_purchase_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPlans(data);
    }
  };

  const handleSubmit = async () => {
    if (!formData.purchase_type || !formData.target_amount) {
      toast({
        title: "Please fill in required fields",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("big_purchase_plans").insert({
      user_id: user.id,
      purchase_type: formData.purchase_type,
      target_amount: parseFloat(formData.target_amount),
      current_savings: parseFloat(formData.current_savings) || 0,
      target_date: formData.target_date || null,
      monthly_budget: formData.monthly_budget ? parseFloat(formData.monthly_budget) : null,
      notes: formData.notes || null,
    });

    if (error) {
      toast({
        title: "Error creating plan",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Purchase plan created!",
      });
      setShowForm(false);
      setFormData({
        purchase_type: "",
        target_amount: "",
        current_savings: "",
        target_date: "",
        monthly_budget: "",
        notes: "",
      });
      fetchPlans();
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthsToGoal = (current: number, target: number, monthly: number) => {
    if (monthly <= 0) return null;
    const remaining = target - current;
    return Math.ceil(remaining / monthly);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Big Purchase Planner</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? "Cancel" : "New Plan"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Purchase Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Purchase Type *</Label>
              <Select value={formData.purchase_type} onValueChange={(value) => setFormData({ ...formData, purchase_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select purchase type" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Amount ($) *</Label>
              <Input
                type="number"
                placeholder="50000"
                value={formData.target_amount}
                onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
              />
            </div>

            <div>
              <Label>Current Savings ($)</Label>
              <Input
                type="number"
                placeholder="10000"
                value={formData.current_savings}
                onChange={(e) => setFormData({ ...formData, current_savings: e.target.value })}
              />
            </div>

            <div>
              <Label>Target Date</Label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              />
            </div>

            <div>
              <Label>Monthly Savings Budget ($)</Label>
              <Input
                type="number"
                placeholder="1000"
                value={formData.monthly_budget}
                onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
              />
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional details about your purchase plan..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full">Create Plan</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const purchaseType = purchaseTypes.find((t) => t.value === plan.purchase_type);
          const Icon = purchaseType?.icon || TrendingUp;
          const progress = calculateProgress(plan.current_savings, plan.target_amount);
          const monthsToGoal = plan.monthly_budget
            ? calculateMonthsToGoal(plan.current_savings, plan.target_amount, plan.monthly_budget)
            : null;

          return (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <Icon className="w-5 h-5 text-primary" />
                  {plan.purchase_type}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-semibold">${plan.current_savings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-semibold">${plan.target_amount.toLocaleString()}</p>
                  </div>
                </div>

                {plan.monthly_budget && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">Monthly Budget</p>
                    <p className="font-medium">${plan.monthly_budget.toLocaleString()}</p>
                    {monthsToGoal && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{monthsToGoal} months to reach goal
                      </p>
                    )}
                  </div>
                )}

                {plan.notes && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm mt-1">{plan.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
