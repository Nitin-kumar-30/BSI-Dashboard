import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/api/entities";
import { 
  Settings as SettingsIcon, 
  X, 
  Save,
  Bell,
  Eye,
  Shield,
  Palette
} from "lucide-react";

export default function Settings({ isOpen, onClose }) {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      mentions: true,
      updates: false
    },
    privacy: {
      profileVisible: true,
      activityVisible: false,
      statusVisible: true
    },
    appearance: {
      theme: 'light',
      density: 'comfortable',
      sidebar: 'expanded'
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Load user settings from user data if available
      if (userData.settings) {
        setSettings(userData.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await User.updateMyUserData({ settings });
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose}>
      <div 
        className="absolute right-4 top-16 w-96 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="glass-card glow-effect shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-blue-500" />
              Settings
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center text-slate-500">Loading...</div>
            ) : (
              <>
                {/* Notifications */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-medium text-slate-900">
                    <Bell className="w-4 h-4" />
                    Notifications
                  </h3>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notif">Email Notifications</Label>
                      <Switch
                        id="email-notif"
                        checked={settings.notifications.email}
                        onCheckedChange={(value) => updateSetting('notifications', 'email', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-notif">Push Notifications</Label>
                      <Switch
                        id="push-notif"
                        checked={settings.notifications.push}
                        onCheckedChange={(value) => updateSetting('notifications', 'push', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mentions-notif">Mentions</Label>
                      <Switch
                        id="mentions-notif"
                        checked={settings.notifications.mentions}
                        onCheckedChange={(value) => updateSetting('notifications', 'mentions', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="updates-notif">System Updates</Label>
                      <Switch
                        id="updates-notif"
                        checked={settings.notifications.updates}
                        onCheckedChange={(value) => updateSetting('notifications', 'updates', value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-medium text-slate-900">
                    <Shield className="w-4 h-4" />
                    Privacy
                  </h3>
                  <div className="space-y-3 pl-6">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="profile-visible">Profile Visible</Label>
                      <Switch
                        id="profile-visible"
                        checked={settings.privacy.profileVisible}
                        onCheckedChange={(value) => updateSetting('privacy', 'profileVisible', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="activity-visible">Activity Visible</Label>
                      <Switch
                        id="activity-visible"
                        checked={settings.privacy.activityVisible}
                        onCheckedChange={(value) => updateSetting('privacy', 'activityVisible', value)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="status-visible">Status Visible</Label>
                      <Switch
                        id="status-visible"
                        checked={settings.privacy.statusVisible}
                        onCheckedChange={(value) => updateSetting('privacy', 'statusVisible', value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Appearance */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-medium text-slate-900">
                    <Palette className="w-4 h-4" />
                    Appearance
                  </h3>
                  <div className="space-y-3 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="theme">Theme</Label>
                      <Select 
                        value={settings.appearance.theme} 
                        onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="density">Display Density</Label>
                      <Select 
                        value={settings.appearance.density} 
                        onValueChange={(value) => updateSetting('appearance', 'density', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="comfortable">Comfortable</SelectItem>
                          <SelectItem value="spacious">Spacious</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <Button onClick={handleSave} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}