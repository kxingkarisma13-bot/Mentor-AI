import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, PauseCircle, StopCircle, Flame, Clock, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  caloriesPerSet: number;
}

interface WorkoutExecutionProps {
  workoutName: string;
  exercises: Exercise[];
  onComplete: () => void;
  onCancel: () => void;
}

export const WorkoutExecution = ({ workoutName, exercises, onComplete, onCancel }: WorkoutExecutionProps) => {
  const { toast } = useToast();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalCalories, setTotalCalories] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const progress = ((currentExerciseIndex + (currentSet / currentExercise.sets)) / totalExercises) * 100;

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetComplete = () => {
    const calories = currentExercise.caloriesPerSet;
    setTotalCalories((prev) => prev + calories);

    if (currentSet < currentExercise.sets) {
      setCurrentSet((prev) => prev + 1);
      toast({
        title: "Set Complete! 🎉",
        description: `+${calories} calories burned`,
      });
    } else {
      // Exercise complete
      setCompletedExercises((prev) => [...prev, currentExercise.name]);
      
      if (currentExerciseIndex < totalExercises - 1) {
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
        toast({
          title: "Exercise Complete! ✅",
          description: `Moving to next exercise`,
        });
      } else {
        // Workout complete
        handleWorkoutComplete();
      }
    }
  };

  const handleWorkoutComplete = async () => {
    setIsActive(false);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('workout_records')
        .insert({
          user_id: user.id,
          workout_name: workoutName,
          duration_minutes: Math.floor(elapsedSeconds / 60),
          calories_burned: totalCalories,
          exercises_completed: completedExercises,
        });

      if (error) throw error;

      toast({
        title: "Workout Complete! 🎊",
        description: `Great job! You burned ${totalCalories} calories in ${formatTime(elapsedSeconds)}`,
      });

      onComplete();
    } catch (error: any) {
      console.error('Error saving workout:', error);
      toast({
        title: "Workout Complete!",
        description: "But couldn't save record. Still great work!",
        variant: "destructive",
      });
      onComplete();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="text-2xl font-bold">{formatTime(elapsedSeconds)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <div>
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="text-2xl font-bold">{totalCalories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Exercises</p>
                <p className="text-2xl font-bold">{completedExercises.length}/{totalExercises}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Current Exercise */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Exercise</span>
            <span className="text-sm font-normal text-muted-foreground">
              Set {currentSet} of {currentExercise.sets}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-6">
              <h3 className="text-3xl font-bold mb-2 animate-scale-in">{currentExercise.name}</h3>
              <p className="text-xl text-muted-foreground">{currentExercise.reps} reps</p>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center pt-4">
              {!isActive ? (
                <Button size="lg" onClick={() => setIsActive(true)} className="gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Start Set
                </Button>
              ) : (
                <>
                  <Button size="lg" variant="outline" onClick={() => setIsActive(false)} className="gap-2">
                    <PauseCircle className="w-5 h-5" />
                    Pause
                  </Button>
                  <Button size="lg" onClick={handleSetComplete} className="gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Complete Set
                  </Button>
                </>
              )}
              <Button size="lg" variant="destructive" onClick={onCancel} className="gap-2">
                <StopCircle className="w-5 h-5" />
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Exercises */}
      {currentExerciseIndex < totalExercises - 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Next Up</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exercises.slice(currentExerciseIndex + 1, currentExerciseIndex + 3).map((exercise, idx) => (
                <div key={idx} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                  <span>{exercise.name}</span>
                  <span className="text-muted-foreground">{exercise.sets} × {exercise.reps}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};