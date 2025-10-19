import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Wind, Music, BookOpen, Footprints, Coffee } from "lucide-react";

const copingActivities = [
  {
    id: "breathing",
    title: "Breathing Exercise",
    icon: Wind,
    duration: "5 minutes",
    description: "Box breathing technique to calm your nervous system",
    steps: [
      "Find a comfortable seated position",
      "Breathe in slowly through your nose for 4 counts",
      "Hold your breath for 4 counts",
      "Exhale slowly through your mouth for 4 counts",
      "Hold empty for 4 counts",
      "Repeat this cycle 5-10 times",
    ],
  },
  {
    id: "grounding",
    title: "5-4-3-2-1 Grounding",
    icon: Brain,
    duration: "3 minutes",
    description: "A sensory awareness exercise to reduce anxiety",
    steps: [
      "Name 5 things you can see around you",
      "Name 4 things you can touch or feel",
      "Name 3 things you can hear",
      "Name 2 things you can smell",
      "Name 1 thing you can taste",
    ],
  },
  {
    id: "music",
    title: "Music Therapy",
    icon: Music,
    duration: "10 minutes",
    description: "Listen to calming music to reduce stress",
    steps: [
      "Put on headphones for better immersion",
      "Choose instrumental or nature sounds",
      "Close your eyes and focus on the sounds",
      "Let the music wash over you without judgment",
      "Notice how your body feels as you listen",
    ],
  },
  {
    id: "journaling",
    title: "Thought Journaling",
    icon: BookOpen,
    duration: "10 minutes",
    description: "Write down your thoughts to process emotions",
    steps: [
      "Get a notebook or open a notes app",
      "Write freely without editing yourself",
      "Describe what you're feeling and why",
      "Don't worry about grammar or spelling",
      "Review what you wrote with compassion",
    ],
  },
  {
    id: "walking",
    title: "Mindful Walking",
    icon: Footprints,
    duration: "15 minutes",
    description: "A gentle walk to clear your mind",
    steps: [
      "Go outside or find a quiet indoor space",
      "Walk at a comfortable, slow pace",
      "Notice the sensation of each step",
      "Observe your surroundings without judgment",
      "Focus on your breath as you walk",
    ],
  },
  {
    id: "tea",
    title: "Tea Ritual",
    icon: Coffee,
    duration: "10 minutes",
    description: "A mindful tea-drinking practice for relaxation",
    steps: [
      "Prepare your favorite calming tea",
      "Watch the steam rise from the cup",
      "Hold the warm cup in your hands",
      "Take small, mindful sips",
      "Notice the warmth spreading through your body",
    ],
  },
];

export const CopingTools = () => {
  const [selectedActivity, setSelectedActivity] = useState<typeof copingActivities[0] | null>(null);

  return (
    <div className="space-y-6">
      {!selectedActivity ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {copingActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <Card
                key={activity.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedActivity(activity)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon className="w-5 h-5 text-primary" />
                    {activity.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">Duration: {activity.duration}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = selectedActivity.icon;
                  return <Icon className="w-6 h-6 text-primary" />;
                })()}
                {selectedActivity.title}
              </CardTitle>
              <Button variant="outline" onClick={() => setSelectedActivity(null)}>
                Back to Activities
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2">{selectedActivity.description}</p>
              <p className="text-sm text-muted-foreground">Duration: {selectedActivity.duration}</p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Follow these steps:</h3>
              <ol className="space-y-3">
                {selectedActivity.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> There's no right or wrong way to do this. Take your time and be gentle with yourself.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
