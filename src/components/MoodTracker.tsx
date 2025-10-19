import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Smile, Meh, Frown, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface MoodEntry {
  id: string;
  mood: string;
  emotion?: string;
  note?: string;
  created_at: string;
}

const moods = [
  { value: "great", label: "Great", icon: Smile, color: "text-green-500" },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-500" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: "bad", label: "Bad", icon: Frown, color: "text-orange-500" },
  { value: "terrible", label: "Terrible", icon: Frown, color: "text-red-500" },
];

export const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState("");
  const [emotion, setEmotion] = useState("");
  const [note, setNote] = useState("");
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentEntries();
  }, []);

  const fetchRecentEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentEntries(data);
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) {
      toast({
        title: "Please select a mood",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("mood_entries").insert({
      user_id: user.id,
      mood: selectedMood,
      emotion: emotion || null,
      note: note || null,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error saving mood entry",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mood tracked successfully",
      });
      setSelectedMood("");
      setEmotion("");
      setNote("");
      fetchRecentEntries();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Track Your Mood
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">How are you feeling today?</p>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((mood) => {
                const Icon = mood.icon;
                return (
                  <Button
                    key={mood.value}
                    variant={selectedMood === mood.value ? "default" : "outline"}
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => setSelectedMood(mood.value)}
                  >
                    <Icon className={`w-6 h-6 ${selectedMood === mood.value ? "" : mood.color}`} />
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">What emotion are you experiencing?</label>
            <input
              type="text"
              placeholder="e.g., anxious, excited, stressed, peaceful"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Add a note (optional)</label>
            <Textarea
              placeholder="What's on your mind?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={saveMoodEntry} disabled={loading} className="w-full">
            Save Mood Entry
          </Button>
        </CardContent>
      </Card>

      {recentEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const mood = moods.find((m) => m.value === entry.mood);
                const Icon = mood?.icon || Meh;
                return (
                  <div key={entry.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 ${mood?.color}`} />
                      <span className="font-medium capitalize">{entry.mood}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {format(new Date(entry.created_at), "MMM d, h:mm a")}
                      </span>
                    </div>
                    {entry.emotion && (
                      <p className="text-sm text-muted-foreground">Emotion: {entry.emotion}</p>
                    )}
                    {entry.note && <p className="text-sm mt-1">{entry.note}</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
