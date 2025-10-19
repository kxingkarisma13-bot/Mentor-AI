import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, Sparkles } from "lucide-react";

interface Inspiration {
  type: "verse" | "prayer" | "quote";
  content: string;
  reference?: string;
}

const inspirations: Inspiration[] = [
  // Bible Verses
  { type: "verse", content: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
  { type: "verse", content: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  { type: "verse", content: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?", reference: "Psalm 27:1" },
  { type: "verse", content: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6" },
  { type: "verse", content: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
  { type: "verse", content: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
  { type: "verse", content: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
  { type: "verse", content: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18" },
  
  // Prayers
  { type: "prayer", content: "Lord, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference. Guide my steps today." },
  { type: "prayer", content: "Heavenly Father, thank You for this new day. Fill me with Your strength and peace. Help me to face any challenges with courage and grace." },
  { type: "prayer", content: "Dear God, I come before You seeking Your guidance. Clear my mind, steady my heart, and show me the path You have set before me." },
  { type: "prayer", content: "Lord, help me to be patient with myself and others today. Grant me compassion, understanding, and the wisdom to choose love in every situation." },
  { type: "prayer", content: "Father, I surrender my worries to You. Replace my anxiety with Your perfect peace that surpasses all understanding." },
  { type: "prayer", content: "Dear Lord, thank You for Your unfailing love. Help me to see Your hand at work in my life and trust in Your perfect timing." },
  
  // Motivational Quotes
  { type: "quote", content: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.", reference: "Steve Jobs" },
  { type: "quote", content: "Believe you can and you're halfway there. Your attitude determines your direction.", reference: "Theodore Roosevelt" },
  { type: "quote", content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", reference: "Winston Churchill" },
  { type: "quote", content: "The future belongs to those who believe in the beauty of their dreams. Never stop pursuing them.", reference: "Eleanor Roosevelt" },
  { type: "quote", content: "Don't watch the clock; do what it does. Keep going. Your persistence will pay off.", reference: "Sam Levenson" },
  { type: "quote", content: "You are never too old to set another goal or to dream a new dream. Start today.", reference: "C.S. Lewis" },
  { type: "quote", content: "The only impossible journey is the one you never begin. Take the first step.", reference: "Tony Robbins" },
  { type: "quote", content: "Your limitation—it's only your imagination. Push beyond your boundaries.", reference: "Unknown" },
  { type: "quote", content: "Great things never come from comfort zones. Embrace the challenge.", reference: "Unknown" },
  { type: "quote", content: "Hard work beats talent when talent doesn't work hard. Keep pushing forward.", reference: "Tim Notke" },
];

interface DailyInspirationDialogProps {
  onClose?: (inspiration: Inspiration) => void;
  manualOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const DailyInspirationDialog = ({ onClose, manualOpen, onOpenChange }: DailyInspirationDialogProps) => {
  const [open, setOpen] = useState(false);
  const [inspiration, setInspiration] = useState<Inspiration | null>(null);

  useEffect(() => {
    // If manually opened, show a new random inspiration
    if (manualOpen) {
      const randomIndex = Math.floor(Math.random() * inspirations.length);
      const selectedInspiration = inspirations[randomIndex];
      setInspiration(selectedInspiration);
      setOpen(true);
      return;
    }

    // Check if user has seen inspiration today
    const lastShown = localStorage.getItem("lastInspirationDate");
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      // Show dialog after a short delay for better UX
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * inspirations.length);
        const selectedInspiration = inspirations[randomIndex];
        setInspiration(selectedInspiration);
        setOpen(true);
        localStorage.setItem("lastInspirationDate", today);
        localStorage.setItem("todayInspiration", JSON.stringify(selectedInspiration));
      }, 1000);
    } else {
      // Load today's inspiration from localStorage
      const stored = localStorage.getItem("todayInspiration");
      if (stored) {
        setInspiration(JSON.parse(stored));
      }
    }
  }, [manualOpen]);

  const handleClose = () => {
    setOpen(false);
    onOpenChange?.(false);
    if (onClose && inspiration) {
      onClose(inspiration);
    }
  };

  const getIcon = () => {
    if (!inspiration) return null;
    switch (inspiration.type) {
      case "verse":
        return <BookOpen className="w-8 h-8 text-primary" />;
      case "prayer":
        return <Heart className="w-8 h-8 text-primary" />;
      case "quote":
        return <Sparkles className="w-8 h-8 text-primary" />;
    }
  };

  const getTitle = () => {
    if (!inspiration) return "";
    switch (inspiration.type) {
      case "verse":
        return "Today's Bible Verse";
      case "prayer":
        return "Prayer for Today";
      case "quote":
        return "Daily Motivation";
    }
  };

  if (!inspiration) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {getIcon()}
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">{getTitle()}</DialogTitle>
          <DialogDescription className="text-center pt-4 text-base leading-relaxed">
            "{inspiration.content}"
          </DialogDescription>
          {inspiration.reference && (
            <p className="text-center text-sm text-muted-foreground italic pt-2">
              — {inspiration.reference}
            </p>
          )}
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Continue to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
