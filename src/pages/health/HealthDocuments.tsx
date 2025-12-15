import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { Plus, FileText, Download, Trash2, File, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";

const HealthDocuments = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    memberId: "",
    category: "report",
    fileUrl: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user?.familyId) return;
      const [docsData, membersData] = await Promise.all([
        apiService.getDocuments(user.familyId),
        apiService.getMembers(user.familyId),
      ]);
      // Filter for health-related documents
      const healthDocs = docsData.filter((doc: any) => 
        doc.tags?.includes("health") || doc.tags?.includes("medical")
      );
      setDocuments(healthDocs);
      setMembers(membersData);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File, preview: string) => {
    setFormData({ ...formData, fileUrl: preview, name: formData.name || file.name });
  };

  const handleUpload = async () => {
    try {
      if (!formData.name || !formData.memberId || !formData.fileUrl) {
        toast({
          title: "Missing fields",
          description: "Please fill in all required fields and select a file",
          variant: "destructive",
        });
        return;
      }

      await apiService.uploadDocument({
        familyId: user?.familyId,
        name: formData.name,
        type: formData.category,
        fileUrl: formData.fileUrl,
        tags: ["health", "medical", formData.category],
        uploadedBy: user?.memberId,
        isEncrypted: false,
      });

      toast({
        title: "Document uploaded",
        description: "Medical document has been saved successfully",
      });

      setDialogOpen(false);
      setFormData({
        name: "",
        memberId: "",
        category: "report",
        fileUrl: "",
      });
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to upload",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await apiService.deleteDocument(docId);
      toast({
        title: "Document deleted",
        description: "Medical document has been removed",
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

  const handlePreview = (doc: any) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Medical Documents</h2>
          <p className="text-muted-foreground">Store and manage medical reports and records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Medical Document</DialogTitle>
              <DialogDescription>Add a medical report or record</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document Name</Label>
                <Input
                  placeholder="Blood test results, X-ray..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Family Member</Label>
                <Select value={formData.memberId} onValueChange={(val) => setFormData({ ...formData, memberId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="report">Medical Report</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="vaccination">Vaccination Record</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>File</Label>
                <FileUpload
                  accept=".pdf,.jpg,.jpeg,.png"
                  onFileSelect={handleFileSelect}
                  maxSize={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No medical documents"
          description="Upload medical reports, prescriptions, and records"
          actionLabel="Upload Document"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => {
            const member = members.find(m => m.id === doc.uploadedBy);
            return (
              <Card key={doc.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{doc.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{doc.type}</Badge>
                          {doc.tags?.filter((tag: string) => tag !== "health" && tag !== "medical").map((tag: string) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreview(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.name}</DialogTitle>
            <DialogDescription>
              Uploaded {selectedDoc && new Date(selectedDoc.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center bg-muted rounded-lg p-4 min-h-[400px]">
            {selectedDoc?.fileUrl && (
              <img
                src={selectedDoc.fileUrl}
                alt={selectedDoc.name}
                className="max-w-full max-h-[60vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthDocuments;
