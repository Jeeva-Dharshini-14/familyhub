import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Pencil, Trash2, Users, Key } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { AvatarUpload } from "@/components/AvatarUpload";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const ManageMembers = () => {
  const user = authUtils.getAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "male",
    relationship: "son",
    role: "child",
    email: "",
    phone: "",
    profileImage: "",
    password: "",
    createLogin: false,
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      if (!user?.familyId) return;
      const data = await apiService.getMembers(user.familyId);
      setMembers(data);
    } catch (error: any) {
      toast({
        title: "Failed to load members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.dateOfBirth) {
        toast({
          title: "Missing fields",
          description: "Name and date of birth are required",
          variant: "destructive",
        });
        return;
      }

      const memberData = {
        ...formData,
        age: parseInt(formData.age),
        familyId: user?.familyId,
        permissions: {
          finance: formData.role === "owner" || formData.role === "adult",
          health: true,
          docs: formData.role === "owner" || formData.role === "adult",
          study: true,
          tasks: true,
          meals: true,
          trips: formData.role !== "child",
        },
      };

      let newMember;
      if (selectedMember) {
        const updatedMember = await apiService.updateMember(selectedMember.id, memberData);
        setMembers(members.map(m => m.id === selectedMember.id ? updatedMember : m));
        toast({
          title: "Member updated",
          description: `${formData.name} has been updated successfully`,
        });
      } else {
        newMember = await apiService.addMember(memberData);
        setMembers([...members, newMember]);
        
        // Create user account if requested
        if (formData.createLogin && formData.email && formData.password) {
          try {
            await apiService.createMemberAccount({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              familyId: user?.familyId,
              memberId: newMember.id,
              role: formData.role,
            });
            toast({
              title: "Member and login created",
              description: `${formData.name} can now login with ${formData.email}`,
            });
          } catch (error: any) {
            toast({
              title: "Member added but login failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Member added",
            description: `${formData.name} has been added to your family`,
          });
        }
      }



      setDialogOpen(false);
      setSelectedMember(null);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Failed to save member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (member: any) => {
    setSelectedMember(member);
    setFormData({
      name: member.name,
      age: member.age.toString(),
      dateOfBirth: member.dateOfBirth,
      gender: member.gender,
      relationship: member.relationship,
      role: member.role,
      email: member.email || "",
      phone: member.phone || "",
      profileImage: member.profileImage || "",
      password: "",
      createLogin: false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (!selectedMember) return;
      await apiService.deleteMember(selectedMember.id);
      toast({
        title: "Member removed",
        description: `${selectedMember.name} has been removed from your family`,
      });
      setDeleteDialogOpen(false);
      setSelectedMember(null);
      loadMembers();
    } catch (error: any) {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      age: "",
      dateOfBirth: "",
      gender: "male",
      relationship: "son",
      role: "child",
      email: "",
      phone: "",
      profileImage: "",
      password: "",
      createLogin: false,
    });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: any = {
      owner: "default",
      adult: "secondary",
      teen: "outline",
      child: "outline",
      guest: "outline",
    };
    return variants[role] || "outline";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Family Members</CardTitle>
              <CardDescription>Manage your family members and their roles</CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No family members yet"
              description="Add your first family member to get started"
              actionLabel="Add Member"
              onAction={() => { resetForm(); setDialogOpen(true); }}
            />
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={member.profileImage} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{member.name}</p>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {member.relationship} • {member.age} years old
                      </p>
                      {member.email && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Key className="inline h-3 w-3 mr-1" />
                          {member.email}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleEdit(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={member.id === user?.memberId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMember ? "Edit Member" : "Add Family Member"}</DialogTitle>
            <DialogDescription>
              {selectedMember ? "Update member information" : "Add a new member to your family"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <AvatarUpload
                currentImage={formData.profileImage}
                onImageChange={(image) => setFormData({ ...formData, profileImage: image })}
                name={formData.name || "New Member"}
                size="lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const dob = e.target.value;
                    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                    setFormData({ ...formData, dateOfBirth: dob, age: age.toString() });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="0"
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Relationship</Label>
                <Select value={formData.relationship} onValueChange={(val) => setFormData({ ...formData, relationship: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="son">Son</SelectItem>
                    <SelectItem value="daughter">Daughter</SelectItem>
                    <SelectItem value="grandfather">Grandfather</SelectItem>
                    <SelectItem value="grandmother">Grandmother</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => setFormData({ ...formData, role: val })}
                  disabled={user?.role !== "owner"}
                >
                  <SelectTrigger>
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
                {user?.role !== "owner" && (
                  <p className="text-xs text-muted-foreground">Only owners can edit member roles</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {!selectedMember && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="createLogin"
                    checked={formData.createLogin}
                    onChange={(e) => setFormData({ ...formData, createLogin: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="createLogin" className="text-sm font-medium">
                    Create login account for this member
                  </Label>
                </div>
                
                {formData.createLogin && (
                  <div className="grid grid-cols-1 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Login Email *</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="member@example.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This member will be able to log in with these credentials and access tasks assigned to them.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); setSelectedMember(null); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {selectedMember ? "Update" : "Add"} Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedMember?.name} from your family? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
