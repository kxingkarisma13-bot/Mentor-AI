import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Dumbbell, Loader2, Play, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WorkoutExecution } from "@/components/WorkoutExecution";

const Fitness = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [workoutRecords, setWorkoutRecords] = useState<any[]>([]);
  const [mealPlan, setMealPlan] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    height_cm: "",
    weight_kg: "",
    fitness_level: "",
    fitness_goals: "",
    health_conditions: "",
    dietary_preferences: "",
  });

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_fitness_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setHasProfile(true);
        setFormData({
          height_cm: profile.height_cm?.toString() || "",
          weight_kg: profile.weight_kg?.toString() || "",
          fitness_level: profile.fitness_level || "",
          fitness_goals: profile.fitness_goals?.join(", ") || "",
          health_conditions: profile.health_conditions?.join(", ") || "",
          dietary_preferences: profile.dietary_preferences?.join(", ") || "",
        });
      }

      // Load active workout plan
      const { data: plan } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (plan) {
        setWorkoutPlan(plan);
      }

      // Load workout records
      const { data: records } = await supabase
        .from('workout_records')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      if (records) {
        setWorkoutRecords(records);
      }

      // Load active meal plan
      const { data: meal } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (meal) {
        setMealPlan(meal);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const profileData = {
        user_id: user.id,
        height_cm: parseFloat(formData.height_cm),
        weight_kg: parseFloat(formData.weight_kg),
        fitness_level: formData.fitness_level,
        fitness_goals: formData.fitness_goals.split(',').map(g => g.trim()).filter(Boolean),
        health_conditions: formData.health_conditions.split(',').map(h => h.trim()).filter(Boolean),
        dietary_preferences: formData.dietary_preferences.split(',').map(d => d.trim()).filter(Boolean),
      };

      const { error } = await supabase
        .from('user_fitness_profiles')
        .upsert(profileData);

      if (error) throw error;

      setHasProfile(true);
      toast({
        title: "Profile Saved",
        description: "Your fitness profile has been updated.",
      });
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

  const generateWorkoutPlan = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const prompt = `Create a simple, easy-to-follow ${formData.fitness_level} workout plan for:
- Height: ${formData.height_cm}cm, Weight: ${formData.weight_kg}kg
- Fitness Level: ${formData.fitness_level}
- Goals: ${formData.fitness_goals}
- Health considerations: ${formData.health_conditions || "None"}

IMPORTANT: Format as a simple bullet-point list (like a to-do list). Keep it concise and actionable.

Structure the plan as:
WEEK 1-2:
• Monday: [Exercise name] - [sets]x[reps], [Exercise name] - [sets]x[reps]
• Tuesday: Rest or [Light activity]
• Wednesday: [Exercise name] - [sets]x[reps]
[continue pattern]

WEEK 3-4:
[Same format with increased intensity]

Keep each line short and clear. No paragraphs.`;

      const { data, error } = await supabase.functions.invoke('mentor-chat', {
        body: { messages: [{ role: 'user', content: prompt }] }
      });

      if (error) throw error;

      // Save the workout plan
      const { error: insertError } = await supabase
        .from('workout_plans')
        .insert({
          user_id: user.id,
          title: `${formData.fitness_level} Workout Plan`,
          description: `Generated plan for ${formData.fitness_goals}`,
          plan_data: { content: data.content },
          duration_weeks: 4,
          is_active: true,
        });

      if (insertError) throw insertError;

      setWorkoutPlan({ plan_data: { content: data.content } });
      
      toast({
        title: "Plan Generated",
        description: "Your personalized workout plan is ready!",
      });
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

  const generateMealPlan = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const workoutContext = workoutPlan 
        ? `This meal plan should support their workout routine focused on: ${formData.fitness_goals}` 
        : '';

      const prompt = `Create a simple meal plan optimized for fitness goals:
- Height: ${formData.height_cm}cm, Weight: ${formData.weight_kg}kg
- Fitness Level: ${formData.fitness_level}
- Goals: ${formData.fitness_goals}
- Health considerations: ${formData.health_conditions || "None"}
- Dietary preferences: ${formData.dietary_preferences || "None"}
${workoutContext}

IMPORTANT: Format as simple bullet points (like a to-do list). No paragraphs.

For each day, list meals with specific foods from each food group:

DAY 1:
• Breakfast: [Protein source - amount], [Whole grain - amount], [Fruit/Veg - amount] (~[calories] cal)
• Lunch: [Protein], [Carb], [Vegetables], [Healthy fat] (~[calories] cal)
• Snack: [Food - amount] (~[calories] cal)
• Dinner: [Protein], [Carb], [Vegetables] (~[calories] cal)
• Daily Total: [Total calories], Protein: [g], Carbs: [g], Fats: [g]

Continue for 7 days. Keep each line short. Include specific amounts (e.g., "200g chicken breast", "1 cup rice").`;

      const { data, error } = await supabase.functions.invoke('mentor-chat', {
        body: { messages: [{ role: 'user', content: prompt }] }
      });

      if (error) throw error;

      // Save the meal plan
      const { error: insertError } = await supabase
        .from('meal_plans')
        .insert({
          user_id: user.id,
          title: `${formData.fitness_level} Meal Plan`,
          description: `Optimized for ${formData.fitness_goals}`,
          plan_data: { content: data.content },
          duration_weeks: 1,
          is_active: true,
        });

      if (insertError) throw insertError;

      setMealPlan({ plan_data: { content: data.content } });
      
      toast({
        title: "Meal Plan Generated",
        description: "Your personalized meal plan is ready!",
      });
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

  const sampleExercises = [
    { name: "Push-ups", sets: 3, reps: "12", caloriesPerSet: 15 },
    { name: "Squats", sets: 3, reps: "15", caloriesPerSet: 20 },
    { name: "Plank", sets: 3, reps: "30s", caloriesPerSet: 10 },
    { name: "Lunges", sets: 3, reps: "10 each leg", caloriesPerSet: 18 },
    { name: "Mountain Climbers", sets: 3, reps: "20", caloriesPerSet: 22 },
  ];

  const startWorkout = () => {
    setIsExecuting(true);
  };

  const handleWorkoutComplete = () => {
    setIsExecuting(false);
    checkProfile(); // Reload records
  };

  if (isExecuting) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={() => setIsExecuting(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <WorkoutExecution
            workoutName="Quick Workout"
            exercises={sampleExercises}
            onComplete={handleWorkoutComplete}
            onCancel={() => setIsExecuting(false)}
          />
        </main>
      </div>
    );
  }

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
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Dumbbell className="w-10 h-10 text-primary" />
            Fitness Module
          </h1>
          <p className="text-xl text-muted-foreground">Personalized workout plans powered by AI</p>
        </div>

        {/* Fitness Profile Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Fitness Profile</CardTitle>
            <CardDescription>Help us create the perfect workout plan for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                  placeholder="175"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight_kg}
                  onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                  placeholder="70"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="fitness_level">Fitness Level</Label>
              <Select value={formData.fitness_level} onValueChange={(value) => setFormData({ ...formData, fitness_level: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goals">Fitness Goals (comma-separated)</Label>
              <Input
                id="goals"
                value={formData.fitness_goals}
                onChange={(e) => setFormData({ ...formData, fitness_goals: e.target.value })}
                placeholder="Weight loss, Muscle building, Endurance"
              />
            </div>

            <div>
              <Label htmlFor="health">Health Conditions (comma-separated, optional)</Label>
              <Input
                id="health"
                value={formData.health_conditions}
                onChange={(e) => setFormData({ ...formData, health_conditions: e.target.value })}
                placeholder="None, or list any relevant conditions"
              />
            </div>

            <div>
              <Label htmlFor="diet">Dietary Preferences (comma-separated, optional)</Label>
              <Input
                id="diet"
                value={formData.dietary_preferences}
                onChange={(e) => setFormData({ ...formData, dietary_preferences: e.target.value })}
                placeholder="Vegetarian, High-protein, etc."
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Generate Workout & Meal Plans */}
        {hasProfile && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="bg-[image:var(--gradient-card)]">
              <CardHeader>
                <CardTitle>Generate Workout Plan</CardTitle>
                <CardDescription>AI will create a personalized workout plan</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateWorkoutPlan} 
                  disabled={loading}
                  className="w-full bg-[image:var(--gradient-primary)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  Generate Workout Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[image:var(--gradient-card)]">
              <CardHeader>
                <CardTitle>Generate Meal Plan</CardTitle>
                <CardDescription>AI will create a nutrition plan for your goals</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateMealPlan} 
                  disabled={loading}
                  className="w-full bg-[image:var(--gradient-primary)]"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  Generate Meal Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Workout */}
        {hasProfile && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Quick Workout
              </CardTitle>
              <CardDescription>Start a guided workout session with real-time tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={startWorkout} size="lg" className="w-full">
                Start Workout Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Workout Records */}
        {workoutRecords.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Workouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workoutRecords.map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{record.workout_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.completed_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{record.calories_burned} cal</p>
                      <p className="text-sm text-muted-foreground">{record.duration_minutes} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display Workout Plan */}
        {workoutPlan && (
          <Card className="mb-8 border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" />
                Your Workout Plan
              </CardTitle>
              <CardDescription>Follow this plan to reach your fitness goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-6 rounded-lg">
                {workoutPlan.plan_data.content}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display Meal Plan */}
        {mealPlan && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🥗 Your Meal Plan
              </CardTitle>
              <CardDescription>Nutrition plan optimized for your workout goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-muted/30 p-6 rounded-lg">
                {mealPlan.plan_data.content}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Fitness;
