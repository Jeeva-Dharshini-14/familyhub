import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Plus, User, Edit, Pill, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const HealthFamily = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    medicalHistory: "",
    medications: "",
    allergies: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user?.familyId) return;
      const membersData = await apiService.getMembers(user.familyId);
      setMembers(membersData);
    } catch (error) {
      console.error("Failed to load members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (member: any) => {
    setSelectedMember(member);
    setFormData({
      medicalHistory: member.medicalHistory || "",
      medications: member.medications || "",
      allergies: member.allergies || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!selectedMember) return;

      await apiService.updateMember(selectedMember.id, {
        medicalHistory: formData.medicalHistory,
        medications: formData.medications,
        allergies: formData.allergies,
      });

      toast({
        title: "Health info updated",
        description: "Medical information has been saved successfully",
      });

      setDialogOpen(false);
      setSelectedMember(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to update",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Family Health Management</h2>
        <p className="text-muted-foreground">Manage health information for each family member</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {members.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.profileImage} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription>{member.age} years old</CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenEdit(member)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.allergies && (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Allergies</p>
                    <p className="text-sm text-muted-foreground">{member.allergies}</p>
                  </div>
                </div>
              )}
              {member.medications && (
                <div className="flex items-start gap-2">
                  <Pill className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Current Medications</p>
                    <p className="text-sm text-muted-foreground">{member.medications}</p>
                  </div>
                </div>
              )}
              {member.medicalHistory && (
                <div>
                  <p className="text-sm font-medium mb-1">Medical History</p>
                  <p className="text-sm text-muted-foreground">{member.medicalHistory}</p>
                </div>
              )}
              {!member.allergies && !member.medications && !member.medicalHistory && (
                <p className="text-sm text-muted-foreground">No health information added yet</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Health Information</DialogTitle>
            <DialogDescription>
              Update medical information for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Medical History</Label>
              <Textarea
                placeholder="Past illnesses, surgeries, conditions..."
                value={formData.medicalHistory}
                onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Current Medications</Label>
              <Textarea
                placeholder="List ongoing medications and dosages..."
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Allergies</Label>
              <Input
                placeholder="Food allergies, drug allergies..."
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthFamily;
