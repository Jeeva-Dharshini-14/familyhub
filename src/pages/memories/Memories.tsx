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
import { Skeleton } from "@/components/ui/skeleton";

const Memories = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    photoUrl: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user?.familyId) return;
      const memoriesData = await apiService.getMemories(user.familyId);
      setMemories(memoriesData);
    } catch (error) {
      console.error("Failed to load memories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File, preview: string) => {
    // Store the preview for display
    setFormData({ ...formData, photoUrl: preview });
  };

  const handleAdd = async () => {
    try {
      if (!formData.title) {
        toast({
          title: "Missing fields",
          description: "Please add a title",
          variant: "destructive",
        });
        return;
      }

      const memoryData = {
        familyId: user?.familyId,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        photoUrl: formData.photoUrl || "",
        createdBy: user?.memberId,
      };
      
      await apiService.addMemory(memoryData);

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
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to add memory",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (memoryId: string) => {
    try {
      await apiService.deleteMemory(memoryId);
      toast({
        title: "Memory deleted",
        description: "Memory has been removed",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memories</h1>
          <p className="text-muted-foreground">Capture and cherish family moments</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Tell the story behind this memory..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              <Button onClick={handleAdd}>Save Memory</Button>
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
  );
};

export default Memories;
