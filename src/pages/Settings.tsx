import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Moon, Sun, Volume2, Globe, Bell, Accessibility, Palette, Shield, Lock, Download, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { VoiceSynthesis } from "@/utils/voiceUtils";
import { supabase } from "@/integrations/supabase/client";
import { ProfileEditor } from "@/components/ProfileEditor";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [selectedVoice, setSelectedVoice] = useState<string>("default");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [language, setLanguage] = useState<string>("en");
  const [fontSize, setFontSize] = useState<number>(16);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [motivationNotifications, setMotivationNotifications] = useState<boolean>(true);
  const [reminderNotifications, setReminderNotifications] = useState<boolean>(true);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [backgroundTheme, setBackgroundTheme] = useState<string>("default");
  const [customPrimary, setCustomPrimary] = useState<string>("#9b87f5");
  const [customSecondary, setCustomSecondary] = useState<string>("#7E69AB");
  const [sessionTimeout, setSessionTimeout] = useState<boolean>(true);
  const [dataEncryption, setDataEncryption] = useState<boolean>(true);

  useEffect(() => {
    // Load voices
    const voiceUtils = new VoiceSynthesis();
    const loadVoices = () => {
      const voices = voiceUtils.getVoices();
      setAvailableVoices(voices);
    };
    
    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Load saved settings from localStorage
    const savedVoice = localStorage.getItem("ai-voice");
    const savedLanguage = localStorage.getItem("language");
    const savedFontSize = localStorage.getItem("fontSize");
    const savedNotifications = localStorage.getItem("notificationsEnabled");
    const savedMotivation = localStorage.getItem("motivationNotifications");
    const savedReminder = localStorage.getItem("reminderNotifications");
    const savedHighContrast = localStorage.getItem("highContrast");
    const savedReducedMotion = localStorage.getItem("reducedMotion");
    const savedBackgroundTheme = localStorage.getItem("backgroundTheme");
    const savedCustomPrimary = localStorage.getItem("customPrimary");
    const savedCustomSecondary = localStorage.getItem("customSecondary");

    if (savedVoice) setSelectedVoice(savedVoice);
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedNotifications) setNotificationsEnabled(savedNotifications === "true");
    if (savedMotivation) setMotivationNotifications(savedMotivation === "true");
    if (savedReminder) setReminderNotifications(savedReminder === "true");
    if (savedHighContrast) setHighContrast(savedHighContrast === "true");
    if (savedReducedMotion) setReducedMotion(savedReducedMotion === "true");
    if (savedBackgroundTheme) setBackgroundTheme(savedBackgroundTheme);
    if (savedCustomPrimary) setCustomPrimary(savedCustomPrimary);
    if (savedCustomSecondary) setCustomSecondary(savedCustomSecondary);
    
    const savedSessionTimeout = localStorage.getItem("sessionTimeout");
    const savedDataEncryption = localStorage.getItem("dataEncryption");
    if (savedSessionTimeout) setSessionTimeout(savedSessionTimeout === "true");
    if (savedDataEncryption) setDataEncryption(savedDataEncryption === "true");

    // Check notification permission
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  useEffect(() => {
    // Apply font size to root element
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  useEffect(() => {
    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
  }, [reducedMotion]);

  useEffect(() => {
    // Apply background theme
    applyBackgroundTheme();
  }, [backgroundTheme, customPrimary, customSecondary]);

  const applyBackgroundTheme = () => {
    const root = document.documentElement;
    
    if (backgroundTheme === "custom") {
      // Convert hex to HSL
      const primary = hexToHSL(customPrimary);
      const secondary = hexToHSL(customSecondary);
      
      root.style.setProperty('--primary', primary);
      root.style.setProperty('--primary-foreground', '0 0% 100%');
      root.style.setProperty('--secondary', secondary);
    } else if (backgroundTheme === "ocean") {
      root.style.setProperty('--primary', '200 100% 40%');
      root.style.setProperty('--secondary', '190 80% 50%');
    } else if (backgroundTheme === "sunset") {
      root.style.setProperty('--primary', '15 80% 50%');
      root.style.setProperty('--secondary', '30 70% 55%');
    } else if (backgroundTheme === "forest") {
      root.style.setProperty('--primary', '140 60% 40%');
      root.style.setProperty('--secondary', '120 50% 50%');
    } else if (backgroundTheme === "lavender") {
      root.style.setProperty('--primary', '270 60% 65%');
      root.style.setProperty('--secondary', '260 50% 55%');
    }
  };

  const hexToHSL = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '270 60% 65%';
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const handleVoiceChange = (value: string) => {
    setSelectedVoice(value);
    localStorage.setItem("ai-voice", value);
    toast({
      title: "Voice Updated",
      description: "Your AI voice preference has been saved",
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("language", value);
    toast({
      title: "Language Updated",
      description: "Language preference saved",
    });
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    localStorage.setItem("fontSize", value[0].toString());
  };

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          localStorage.setItem("notificationsEnabled", "true");
          toast({
            title: "Notifications Enabled",
            description: "You'll receive motivational reminders",
          });
          
          // Show a test notification
          new Notification("Mentor AI", {
            body: "Notifications are now enabled! 🎉",
            icon: "/favicon.ico",
          });
        } else {
          toast({
            title: "Permission Denied",
            description: "Please enable notifications in your browser settings",
            variant: "destructive",
          });
        }
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem("notificationsEnabled", "false");
    }
  };

  const handleMotivationToggle = (checked: boolean) => {
    setMotivationNotifications(checked);
    localStorage.setItem("motivationNotifications", checked.toString());
  };

  const handleReminderToggle = (checked: boolean) => {
    setReminderNotifications(checked);
    localStorage.setItem("reminderNotifications", checked.toString());
  };

  const handleHighContrastToggle = (checked: boolean) => {
    setHighContrast(checked);
    localStorage.setItem("highContrast", checked.toString());
    toast({
      title: checked ? "High Contrast Enabled" : "High Contrast Disabled",
      description: "Visual appearance updated",
    });
  };

  const handleReducedMotionToggle = (checked: boolean) => {
    setReducedMotion(checked);
    localStorage.setItem("reducedMotion", checked.toString());
    toast({
      title: checked ? "Reduced Motion Enabled" : "Reduced Motion Disabled",
      description: "Animation preferences updated",
    });
  };

  const handleBackgroundThemeChange = (value: string) => {
    setBackgroundTheme(value);
    localStorage.setItem("backgroundTheme", value);
    toast({
      title: "Background Theme Updated",
      description: "Your theme preference has been saved",
    });
  };

  const handleCustomColorChange = (type: 'primary' | 'secondary', color: string) => {
    if (type === 'primary') {
      setCustomPrimary(color);
      localStorage.setItem("customPrimary", color);
    } else {
      setCustomSecondary(color);
      localStorage.setItem("customSecondary", color);
    }
  };

  const handleExportData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to export data",
          variant: "destructive",
        });
        return;
      }

      // Gather all user data
      const userData = {
        exported_at: new Date().toISOString(),
        user_email: session.user.email,
        settings: {
          theme,
          language,
          fontSize,
          notifications: { notificationsEnabled, motivationNotifications, reminderNotifications },
          accessibility: { highContrast, reducedMotion },
          backgroundTheme,
        },
        // Include localStorage data
        localStorage: Object.keys(localStorage).reduce((acc, key) => {
          acc[key] = localStorage.getItem(key);
          return acc;
        }, {} as Record<string, string | null>),
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mentor-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your data has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Restore settings
        if (data.settings) {
          if (data.settings.theme) setTheme(data.settings.theme);
          if (data.settings.language) setLanguage(data.settings.language);
          if (data.settings.fontSize) setFontSize(data.settings.fontSize);
          if (data.settings.backgroundTheme) setBackgroundTheme(data.settings.backgroundTheme);
        }

        // Restore localStorage
        if (data.localStorage) {
          Object.entries(data.localStorage).forEach(([key, value]) => {
            if (value !== null) localStorage.setItem(key, value as string);
          });
        }

        toast({
          title: "Data Restored",
          description: "Your settings have been restored successfully",
        });
        
        // Reload to apply all changes
        window.location.reload();
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to restore data. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your Mentor AI experience</p>
        </div>

        <div className="space-y-6">
          {/* Profile Editor */}
          <ProfileEditor />

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Appearance
              </CardTitle>
              <CardDescription>Choose your preferred theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-toggle">Dark Mode</Label>
                <Switch
                  id="theme-toggle"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Background Theme
              </CardTitle>
              <CardDescription>Customize your background colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme Presets</Label>
                <Select value={backgroundTheme} onValueChange={handleBackgroundThemeChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default (Purple)</SelectItem>
                    <SelectItem value="ocean">Ocean Blue</SelectItem>
                    <SelectItem value="sunset">Sunset Orange</SelectItem>
                    <SelectItem value="forest">Forest Green</SelectItem>
                    <SelectItem value="lavender">Lavender</SelectItem>
                    <SelectItem value="custom">Custom Colors</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {backgroundTheme === "custom" && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="primary-color"
                        type="color"
                        value={customPrimary}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customPrimary}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md"
                        placeholder="#9b87f5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        id="secondary-color"
                        type="color"
                        value={customSecondary}
                        onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customSecondary}
                        onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-md"
                        placeholder="#7E69AB"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Voice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                AI Voice
              </CardTitle>
              <CardDescription>Select your preferred AI voice</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Language
              </CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive motivational messages and reminders</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
              
              {notificationsEnabled && (
                <>
                  <div className="flex items-center justify-between pl-4 border-l-2 border-primary">
                    <div>
                      <Label htmlFor="motivation">Motivation Messages</Label>
                      <p className="text-sm text-muted-foreground">Daily inspiration and encouragement</p>
                    </div>
                    <Switch
                      id="motivation"
                      checked={motivationNotifications}
                      onCheckedChange={handleMotivationToggle}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pl-4 border-l-2 border-primary">
                    <div>
                      <Label htmlFor="reminders">Goal Reminders</Label>
                      <p className="text-sm text-muted-foreground">Reminders about your goals and progress</p>
                    </div>
                    <Switch
                      id="reminders"
                      checked={reminderNotifications}
                      onCheckedChange={handleReminderToggle}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="w-5 h-5" />
                Accessibility
              </CardTitle>
              <CardDescription>Adjust settings for better accessibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                <Slider
                  id="font-size"
                  min={12}
                  max={24}
                  step={1}
                  value={[fontSize]}
                  onValueChange={handleFontSizeChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="high-contrast">High Contrast</Label>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch
                  id="high-contrast"
                  checked={highContrast}
                  onCheckedChange={handleHighContrastToggle}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="reduced-motion">Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch
                  id="reduced-motion"
                  checked={reducedMotion}
                  onCheckedChange={handleReducedMotionToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>Manage your security and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="session-timeout">Auto Session Timeout</Label>
                  <p className="text-sm text-muted-foreground">Automatically log out after 30 minutes of inactivity</p>
                </div>
                <Switch
                  id="session-timeout"
                  checked={sessionTimeout}
                  onCheckedChange={(checked) => {
                    setSessionTimeout(checked);
                    localStorage.setItem("sessionTimeout", checked.toString());
                    toast({
                      title: checked ? "Session Timeout Enabled" : "Session Timeout Disabled",
                      description: "Security preference updated",
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-encryption">Enhanced Data Protection</Label>
                  <p className="text-sm text-muted-foreground">Your data is encrypted and protected with RLS policies</p>
                </div>
                <Switch
                  id="data-encryption"
                  checked={dataEncryption}
                  disabled
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Secure Authentication</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your account is protected with secure authentication. All data is encrypted in transit and at rest.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Data Management
              </CardTitle>
              <CardDescription>Backup and restore your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Export Your Data</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Download a backup of your settings and preferences
                </p>
                <Button onClick={handleExportData} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <div className="pt-4 border-t">
                <Label>Restore From Backup</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Import a previously exported backup file
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => document.getElementById('import-file')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                  <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Privacy Notice</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your data is stored securely and never shared with third parties. You have full control over your information.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
