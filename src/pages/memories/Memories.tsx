import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Plus, Trash2, Calendar } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { FileUpload } from "@/components/FileUpload";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const Memories = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    photoUrl: "",
  });

  useEffect(() => {
    if (!user?.familyId) {
      setMemories([]);
      return;
    }

    // Load data in background without blocking UI
    apiService.getMemories(user.familyId)
      .then(memoriesData => setMemories(memoriesData || []))
      .catch(() => setMemories([]));
  }, [user?.familyId]);

  const handleFileSelect = (file: File, preview: string) => {
    setFormData(prev => ({ ...prev, photoUrl: preview }));
  };

  const handleAdd = async () => {
    if (!formData.title) {
      toast({
        title: "Missing fields",
        description: "Please add a title",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      
      const savedMemory = await apiService.addMemory({
        familyId: user?.familyId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        photoUrl: formData.photoUrl || "",
        createdBy: user?.memberId,
      });
      
      setMemories(prev => [savedMemory, ...prev]);

      toast({
        title: "Memory added",
        description: "Memory has been saved successfully",
      });

      setDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        photoUrl: "",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add memory",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (memoryId: string) => {
    try {
      await apiService.deleteMemory(memoryId);
      setMemories(prev => prev.filter(m => m.id !== memoryId));
      
      toast({
        title: "Memory deleted",
        description: "Memory has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Memories</h1>
            <p className="text-muted-foreground">Capture and cherish family moments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="hidden md:flex">
                <Plus className="mr-2 h-4 w-4" />
                Create Memory
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Memory</DialogTitle>
                <DialogDescription>Add a special moment to your family timeline</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Summer vacation, Birthday party..."
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Tell the story behind this memory..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <FileUpload
                    accept="image/*"
                    onFileSelect={handleFileSelect}
                    maxSize={5}
                  />
                  <p className="text-xs text-muted-foreground">Max size: 5MB for high quality photos</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} disabled={saving}>
                  {saving ? "Saving..." : "Save Memory"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {memories.length === 0 ? (
          <EmptyState
            icon={Camera}
            title="No memories yet"
            description="Start creating albums and capturing special moments"
            actionLabel="Create Memory"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {memories.map((memory) => (
              <Card key={memory.id} className="overflow-hidden">
                {memory.photoUrl && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={memory.photoUrl}
                      alt={memory.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{memory.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(memory.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(memory.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {memory.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{memory.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Mobile sticky action button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setDialogOpen(true)}
          size="lg"
          className="rounded-full shadow-lg"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
};

export default Memories;