import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Settings, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Cityville, ST 12345',
    bio: 'Active community member interested in improving local infrastructure and services.',
    joinDate: '2024-01-01',
    preferences: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const stats = [
    { label: 'Issues Reported', value: '12', icon: User },
    { label: 'Issues Resolved', value: '8', icon: Settings },
    { label: 'Active Reports', value: '4', icon: Calendar },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-20 w-20 bg-primary rounded-full flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle>{profileData.name}</CardTitle>
              <CardDescription>Citizen Member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {profileData.joinDate}</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Stats */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Activity Summary</h4>
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
                <Button 
                  variant={isEditing ? "outline" : "default"} 
                  onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                  disabled={isSaving}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-gradient-primary hover:opacity-90 transition-opacity"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you'd like to receive updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {profileData.preferences.emailNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">SMS Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive urgent updates via text</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {profileData.preferences.smsNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Push Notifications</h4>
                    <p className="text-sm text-muted-foreground">Browser notifications for real-time updates</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {profileData.preferences.pushNotifications ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Download My Data
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;