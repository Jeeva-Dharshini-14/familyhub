import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authUtils } from "@/lib/auth";
import { User, Mail, Calendar, Shield, Phone } from "lucide-react";
import { AvatarUpload } from "@/components/AvatarUpload";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatarUrl: user?.avatarUrl || "",
    role: user?.role || "adult",
  });

  useEffect(() => {
    // Load saved photo from localStorage
    const savedPhoto = localStorage.getItem(`profile_photo_${user?.name || 'user'}`);
    if (savedPhoto) {
      setProfileData(prev => ({ ...prev, avatarUrl: savedPhoto }));
    }
  }, [user?.name]);

  const handleImageChange = (imageData: string) => {
    try {
      setProfileData({ ...profileData, avatarUrl: imageData });
      
      // Save to localStorage
      localStorage.setItem(`profile_photo_${user?.name || 'user'}`, imageData);
      
      // Update auth storage
      const updatedUser = { ...user, avatarUrl: imageData };
      authUtils.setAuth(updatedUser as any);
      
      toast({
        title: "Profile photo updated",
        description: "Your profile photo has been saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update photo",
        description: "Could not save profile photo",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    try {
      setLoading(true);
      
      // Save to localStorage
      const profileKey = `profile_${user?.id || 'demo'}`;
      localStorage.setItem(profileKey, JSON.stringify(profileData));
      
      // Update auth storage
      const updatedUser = { 
        ...user, 
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        avatarUrl: profileData.avatarUrl,
        role: profileData.role,
      };
      authUtils.setAuth(updatedUser as any);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
      
      setEditing(false);
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: "Could not save profile changes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">View and manage your profile</p>
      </div>

      {/* Profile Photo Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Upload and save your profile picture</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AvatarUpload
            currentImage={profileData.avatarUrl}
            onImageChange={handleImageChange}
            name={profileData.name}
            size="lg"
            showSaveButton={true}
          />
        </CardContent>
      </Card>

      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </div>
            {!editing && (
              <Button onClick={() => setEditing(true)}>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={profileData.role} onValueChange={(val) => setProfileData({ ...profileData, role: val as any })}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="adult">Adult</SelectItem>
                    <SelectItem value="teen">Teen</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditing(false);
                    setProfileData({
                      name: user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      avatarUrl: user?.avatarUrl || "",
                      role: user?.role || "adult",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:shadow-medium transition-shadow">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{profileData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:shadow-medium transition-shadow">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
              </div>

              {profileData.phone && (
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:shadow-medium transition-shadow">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profileData.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:shadow-medium transition-shadow">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{profileData.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:shadow-medium transition-shadow">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Your access within the family hub</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "Finance", allowed: profileData.role === "owner" || profileData.role === "adult" },
              { name: "Health", allowed: true },
              { name: "Tasks", allowed: true },
              { name: "Documents", allowed: profileData.role === "owner" || profileData.role === "adult" },
              { name: "Settings", allowed: profileData.role === "owner" },
            ].map((permission, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">{permission.name}</span>
                <span className={`text-sm font-medium px-2 py-1 rounded ${permission.allowed ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {permission.allowed ? "Allowed" : "Restricted"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;