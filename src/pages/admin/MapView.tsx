import React, { useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Map, MapPin, Filter, Layers, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge'; 
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// ---- Map container style ----
const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "8px",
};

// ---- Initial map center (your coordinates) ----
const initialCenter = { lat: 24.435439610874177, lng: 77.16086220196595 };

// ---- Mock issues ----
const mockMapIssues = [
  {
    id: "CR-2024-001",
    title: "Pothole on Main Street",
    category: "Pothole",
    priority: "High",
    status: "In Progress",
    coordinates: { lat: 28.435439610874177, lng: 77.16086220196595 },
    address: "NEW DELHI",
  },
  {
    id: "CR-2024-002",
    title: "Broken Street Light",
    category: "Street Light",
    priority: "Medium",
    status: "Assigned",
    coordinates: { lat: 29.435439610874177, lng: 77.16086220196595 },
    address: "PANIPAT",
  },
  {
    id: "CR-2024-004",
    title: "Traffic Signal Malfunction",
    category: "Traffic Signal",
    priority: "Critical",
    status: "Acknowledged",
    coordinates: { lat: 21.435439610874177, lng: 78.16086220196595 },
    address: "AMRAVATI",
  },
  {
    id: "CR-2024-005",
    title: "Park Vandalism",
    category: "Parks & Recreation",
    priority: "Medium",
    status: "Submitted",
    coordinates: { lat: 24.435439610874177, lng: 77.16086220196595 },
    address: "JUET",
  },
];

const priorityColors = { 
  'Critical': 'bg-destructive', 
  'High': 'bg-warning', 
  'Medium': 'bg-primary', 
  'Low': 'bg-muted', 
}; 

const statusColors = { 
  'Submitted': 'border-blue-500', 'Acknowledged': 'border-yellow-500', 
  'Assigned': 'border-purple-500', 
  'In Progress': 'border-orange-500', 
  'Resolved': 'border-green-500', 
};

const MapView = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState("");

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyDjz8ffqZnH5VGL_uEkH7z4FzMzNT2L3Lc", // 🔑 Replace with your real API key
  });

  // Filter issues based on search/category/priority
  const filteredIssues = mockMapIssues.filter((issue) => {
    const matchesCategory = selectedCategory === "all" || issue.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || issue.priority === selectedPriority;
    const matchesSearch =
      searchLocation === "" ||
      issue.address.toLowerCase().includes(searchLocation.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesCategory && matchesPriority && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Map View</h1>
        <p className="text-muted-foreground mt-2">
          Visual overview of civic issues by location across the city.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* --- Filters Panel --- */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Map Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Search Location
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search address..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Pothole">Pothole</SelectItem>
                    <SelectItem value="Street Light">Street Light</SelectItem>
                    <SelectItem value="Traffic Signal">Traffic Signal</SelectItem>
                    <SelectItem value="Parks & Recreation">Parks & Recreation</SelectItem>
                    <SelectItem value="Garbage Collection">Garbage Collection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Priority
                </label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div> <label className="text-sm font-medium text-foreground mb-2 block">Priority</label> <Select value={selectedPriority} onValueChange={setSelectedPriority}> <SelectTrigger> <SelectValue placeholder="All Priorities" /> </SelectTrigger> <SelectContent> <SelectItem value="all">All Priorities</SelectItem> <SelectItem value="Critical">Critical</SelectItem> <SelectItem value="High">High</SelectItem> <SelectItem value="Medium">Medium</SelectItem> <SelectItem value="Low">Low</SelectItem> </SelectContent> </Select> </div>


            <div className="pt-4 border-t"> <h4 className="text-sm font-medium text-foreground mb-2">Legend</h4> <div className="space-y-2 text-xs"> <div className="flex items-center gap-2"> <div className="w-3 h-3 rounded-full bg-destructive"></div> <span>Critical Priority</span> </div> <div className="flex items-center gap-2"> <div className="w-3 h-3 rounded-full bg-warning"></div> <span>High Priority</span> </div> <div className="flex items-center gap-2"> <div className="w-3 h-3 rounded-full bg-primary"></div> <span>Medium Priority</span> </div> <div className="flex items-center gap-2"> <div className="w-3 h-3 rounded-full bg-muted"></div> <span>Low Priority</span> </div> </div> </div> </CardContent> </Card> <Card> <CardHeader> <CardTitle className="text-lg flex items-center gap-2"> <Layers className="h-5 w-5" /> Map Layers </CardTitle> </CardHeader> <CardContent className="space-y-3"> <label className="flex items-center gap-2 cursor-pointer"> <input type="checkbox" defaultChecked className="rounded" /> <span className="text-sm">Issue Markers</span> </label> <label className="flex items-center gap-2 cursor-pointer"> <input type="checkbox" defaultChecked className="rounded" /> <span className="text-sm">Heat Map</span> </label> <label className="flex items-center gap-2 cursor-pointer"> <input type="checkbox" className="rounded" /> <span className="text-sm">District Boundaries</span> </label> <label className="flex items-center gap-2 cursor-pointer"> <input type="checkbox" className="rounded" /> <span className="text-sm">Traffic Overlay</span> </label> </CardContent> </Card> </div>

        {/* --- Map Container --- */}
        <div className="lg:col-span-3">
          <Card className="h-[805px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-3 w-5" />
                  City Issues Map
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  Showing {filteredIssues.length} issues
                </span>
              </div>
            </CardHeader>
            <CardContent className="h-[710px]">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={initialCenter}
                  zoom={15}
                >
                  {filteredIssues.map((issue) => (
                    <Marker
                      key={issue.id}
                      position={issue.coordinates}
                      onClick={() => setSelectedIssue(issue.id)}
                    >
                      {selectedIssue === issue.id && (
                        <InfoWindow
                          onCloseClick={() => setSelectedIssue(null)}
                          position={issue.coordinates}
                        >
                          <div>
                            <h3 className="font-medium">{issue.title}</h3>
                            <p className="text-sm">{issue.address}</p>
                            <p className="text-xs mt-1">
                              Priority: {issue.priority} | Status: {issue.status}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  ))}
                </GoogleMap>
              ) : (
                <div className="flex items-center justify-center h-full">
                  Loading Map...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      

    {/* Issue Summary */}
<div className="mt-6">
  <Card>
    <CardHeader>
      <CardTitle>Filtered Issues Summary</CardTitle>
      <CardDescription>
        Quick overview of currently visible issues
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedIssue === issue.id
                ? "bg-primary/10 border-primary"
                : "hover:bg-muted/50"
            }`}
            onClick={() =>
              setSelectedIssue(selectedIssue === issue.id ? null : issue.id)
            }
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm text-foreground">
                {issue.title}
              </h4>
              <div
                className={`w-3 h-3 rounded-full ${
                  priorityColors[issue.priority as keyof typeof priorityColors]
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="h-3 w-3" />
              <span>{issue.address}</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {issue.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {issue.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</div>

    </div>
  );
};

export default MapView;