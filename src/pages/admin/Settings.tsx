import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Bell, Users, Shield, Database, Mail, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'Civic Issue Reporting Platform',
    systemDescription: 'Centralized platform for managing civic issues and community reports',
    supportEmail: 'support@civic.gov',
    maxFileSize: '20',
    autoAssignment: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    escalationThreshold: '72',
    
    // User Management
    allowSelfRegistration: true,
    requireEmailVerification: true,
    sessionTimeout: '480',
    
    // Department Settings
    departments: [
      'Road Maintenance',
      'Electrical',
      'Parks & Recreation',
      'Traffic Control',
      'Sanitation',
      'Public Safety'
    ],
    
    // Priority & SLA Settings
    criticalSLA: '4',
    highSLA: '24',
    mediumSLA: '72',
    lowSLA: '168',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Settings saved",
        description: "All system settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system-wide settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={settings.systemName}
                  onChange={(e) => setSettings(prev => ({ ...prev, systemName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="systemDescription">System Description</Label>
              <Textarea
                id="systemDescription"
                value={settings.systemDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, systemDescription: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                <Select value={settings.maxFileSize} onValueChange={(value) => setSettings(prev => ({ ...prev, maxFileSize: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 MB</SelectItem>
                    <SelectItem value="10">10 MB</SelectItem>
                    <SelectItem value="20">20 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Assignment</Label>
                  <p className="text-xs text-muted-foreground">Automatically assign issues to departments</p>
                </div>
                <Switch
                  checked={settings.autoAssignment}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoAssignment: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Send email updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Send text message alerts</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Browser push notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalationThreshold">Escalation Threshold (hours)</Label>
                <Select 
                  value={settings.escalationThreshold} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, escalationThreshold: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">72 hours</SelectItem>
                    <SelectItem value="96">96 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escalate unresolved issues after this time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Configure user access and authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Self Registration</Label>
                    <p className="text-xs text-muted-foreground">Let users create their own accounts</p>
                  </div>
                  <Switch
                    checked={settings.allowSelfRegistration}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowSelfRegistration: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Email Verification</Label>
                    <p className="text-xs text-muted-foreground">Verify email addresses on signup</p>
                  </div>
                  <Switch
                    checked={settings.requireEmailVerification}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select 
                  value={settings.sessionTimeout} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, sessionTimeout: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SLA Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Service Level Agreement (SLA)
            </CardTitle>
            <CardDescription>Configure response and resolution time targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="criticalSLA">Critical Priority (hours)</Label>
                <Input
                  id="criticalSLA"
                  type="number"
                  value={settings.criticalSLA}
                  onChange={(e) => setSettings(prev => ({ ...prev, criticalSLA: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highSLA">High Priority (hours)</Label>
                <Input
                  id="highSLA"
                  type="number"
                  value={settings.highSLA}
                  onChange={(e) => setSettings(prev => ({ ...prev, highSLA: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediumSLA">Medium Priority (hours)</Label>
                <Input
                  id="mediumSLA"
                  type="number"
                  value={settings.mediumSLA}
                  onChange={(e) => setSettings(prev => ({ ...prev, mediumSLA: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lowSLA">Low Priority (hours)</Label>
                <Input
                  id="lowSLA"
                  type="number"
                  value={settings.lowSLA}
                  onChange={(e) => setSettings(prev => ({ ...prev, lowSLA: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Department Management
            </CardTitle>
            <CardDescription>Manage departments that handle civic issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                {settings.departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-border rounded">
                    <span className="text-sm">{dept}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground">
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                Add New Department
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;