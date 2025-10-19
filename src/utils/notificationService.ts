// Notification service for sending motivational messages and reminders

const motivationalMessages = [
  "You're making great progress! Keep going! 💪",
  "Every small step counts towards your goals! 🎯",
  "Believe in yourself - you've got this! ✨",
  "Your hard work is paying off! 🌟",
  "Stay focused on your goals today! 🚀",
  "You're stronger than you think! 💪",
  "Keep pushing forward! Success is near! 🎉",
  "Your dedication is inspiring! Keep it up! ⭐",
  "Small progress is still progress! 📈",
  "You're creating amazing habits! 🌱",
];

const reminderMessages = [
  "Time to check in on your goals! 📊",
  "Have you logged your progress today? 📝",
  "Don't forget to track your fitness goals! 🏃‍♂️",
  "Take a moment to reflect on your achievements! 🎯",
  "Your daily goals are waiting for you! ✅",
  "Remember to update your workout plan! 💪",
  "Check your financial goals for this week! 💰",
  "Time for your daily wellness check-in! 🧘‍♀️",
];

export class NotificationService {
  static isSupported(): boolean {
    return "Notification" in window;
  }

  static async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  static hasPermission(): boolean {
    if (!this.isSupported()) return false;
    return Notification.permission === "granted";
  }

  static sendMotivation(): void {
    if (!this.hasPermission()) return;
    
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    
    new Notification("Mentor AI - Motivation", {
      body: message,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "motivation",
      requireInteraction: false,
    });
  }

  static sendReminder(message?: string): void {
    if (!this.hasPermission()) return;
    
    const reminderText = message || reminderMessages[Math.floor(Math.random() * reminderMessages.length)];
    
    new Notification("Mentor AI - Reminder", {
      body: reminderText,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "reminder",
      requireInteraction: true,
    });
  }

  static sendCustom(title: string, body: string, tag?: string): void {
    if (!this.hasPermission()) return;
    
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: tag || "custom",
      requireInteraction: false,
    });
  }

  static scheduleDaily(): void {
    if (!this.hasPermission()) return;

    // Schedule motivational messages
    const motivationEnabled = localStorage.getItem("motivationNotifications") !== "false";
    const reminderEnabled = localStorage.getItem("reminderNotifications") !== "false";

    if (motivationEnabled) {
      // Send motivation at 9 AM, 2 PM, and 7 PM
      this.scheduleNotificationAt(9, 0, () => this.sendMotivation());
      this.scheduleNotificationAt(14, 0, () => this.sendMotivation());
      this.scheduleNotificationAt(19, 0, () => this.sendMotivation());
    }

    if (reminderEnabled) {
      // Send reminders at 10 AM and 8 PM
      this.scheduleNotificationAt(10, 0, () => this.sendReminder());
      this.scheduleNotificationAt(20, 0, () => this.sendReminder());
    }
  }

  private static scheduleNotificationAt(hour: number, minute: number, callback: () => void): void {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      callback();
      // Reschedule for the next day
      setInterval(callback, 24 * 60 * 60 * 1000);
    }, timeUntilNotification);
  }
}

// Initialize notifications when the app loads
if (NotificationService.isSupported() && NotificationService.hasPermission()) {
  NotificationService.scheduleDaily();
}
