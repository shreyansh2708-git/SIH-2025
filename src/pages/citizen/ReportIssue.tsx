import React, { useState } from 'react';
import { Camera, MapPin, Mic, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { apiService, ApiError } from '@/services/api';

const ReportIssue = () => {
  const [formData, setFormData] = useState({
    category: '',
    severity: [3],
    description: '',
    location: '',
    images: [] as File[],
    voiceNote: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    'Pothole',
    'Garbage Collection',
    'Street Light',
    'Sewer Issue',
    'Road Maintenance',
    'Public Safety',
    'Parks & Recreation',
    'Traffic Signal',
    'Other'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 3) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 3 images.",
        variant: "destructive",
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 3)
    }));
  };

  const handleVoiceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, voiceNote: file }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create issue
      const issueData = {
        title: `${formData.category} Issue`,
        description: formData.description,
        category: formData.category.toUpperCase().replace(/\s+/g, '_'),
        priority: formData.severity[0] >= 4 ? 'HIGH' : formData.severity[0] >= 3 ? 'MEDIUM' : 'LOW',
        severity: formData.severity[0],
        location: formData.location,
      };

      const response = await apiService.createIssue(issueData);
      
      // Upload files if any
      if (formData.images.length > 0 || formData.voiceNote) {
        const filesToUpload = [
          ...formData.images,
          ...(formData.voiceNote ? [formData.voiceNote] : [])
        ];
        
        await apiService.uploadMultipleFiles(filesToUpload, response.issue.id);
      }
      
      toast({
        title: "Issue reported successfully",
        description: `Your report has been submitted with tracking ID ${response.issue.id}.`,
      });

      // Reset form
      setFormData({
        category: '',
        severity: [3],
        description: '',
        location: '',
        images: [],
        voiceNote: null,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit your report. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }));
          toast({
            title: "Location detected",
            description: "Your current location has been added to the report.",
          });
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to detect your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Report a Civic Issue</h1>
        <p className="text-muted-foreground mt-2">
          Help improve our community by reporting issues that need attention.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Issue Category</CardTitle>
              <CardDescription>What type of issue are you reporting?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Severity Level */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Severity Level</CardTitle>
              <CardDescription>How urgent is this issue? (1 = Low, 5 = Critical)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Slider
                value={formData.severity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low</span>
                <span className="font-medium">Level {formData.severity[0]}</span>
                <span>Critical</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
            <CardDescription>Where is this issue located?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter address or coordinates"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="flex-1"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={getCurrentLocation}
                className="px-3"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
            <CardDescription>Provide details about the issue</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[100px]"
              required
            />
          </CardContent>
        </Card>

        {/* Media Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attachments</CardTitle>
            <CardDescription>Add photos or voice notes to support your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Upload */}
            <div>
              <Label className="text-sm font-medium">Photos (Max 3)</Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {formData.images.length < 3 && (
                  <label className="h-20 w-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Voice Note Upload */}
            <div>
              <Label className="text-sm font-medium">Voice Note (Optional)</Label>
              <div className="mt-2">
                {formData.voiceNote ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Mic className="h-4 w-4 text-primary" />
                    <span className="text-sm">{formData.voiceNote.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, voiceNote: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 p-3 border border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload voice note</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleVoiceUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting Report...' : 'Submit Issue Report'}
        </Button>
      </form>
    </div>
  );
};

export default ReportIssue;