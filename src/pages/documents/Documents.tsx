import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Upload, Folder, Download, Trash2, Search, Eye, Plus, File, FileImage } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const Documents = () => {
  const user = authUtils.getAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<{ file: File; preview: string } | null>(null);
  const [docTags, setDocTags] = useState("");

  const categories = [
    { name: "Medical", icon: Folder, color: "text-primary", count: 0 },
    { name: "Education", icon: Folder, color: "text-secondary", count: 0 },
    { name: "Financial", icon: Folder, color: "text-accent", count: 0 },
    { name: "Legal", icon: Folder, color: "text-destructive", count: 0 },
    { name: "Personal", icon: Folder, color: "text-muted-foreground", count: 0 },
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, selectedCategory]);

  const loadDocuments = async () => {
    try {
      if (!user?.familyId) return;
      const data = await apiService.getDocuments(user.familyId);
      setDocuments(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load documents",
        description: error.message,
        variant: "destructive",
      });
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    if (searchQuery) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((doc) =>
        doc.tags?.includes(selectedCategory)
      );
    }

    setFilteredDocs(filtered);
  };

  const handleUpload = async () => {
    try {
      if (!uploadFile) {
        toast({
          title: "No file selected",
          description: "Please select a file to upload",
          variant: "destructive",
        });
        return;
      }

      const tags = docTags.split(",").map((t) => t.trim()).filter((t) => t);

      await apiService.uploadDocument({
        familyId: user?.familyId,
        name: uploadFile.file.name,
        type: uploadFile.file.type,
        fileUrl: uploadFile.preview, // In real app, this would be uploaded to storage
        tags,
        uploadedBy: user?.memberId,
        isEncrypted: false,
      });

      toast({
        title: "Document uploaded",
        description: `${uploadFile.file.name} has been uploaded successfully`,
      });

      setUploadDialogOpen(false);
      setUploadFile(null);
      setDocTags("");
      loadDocuments();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      if (!selectedDoc) return;
      await apiService.deleteDocument(selectedDoc.id);
      toast({
        title: "Document deleted",
        description: `${selectedDoc.name} has been deleted`,
      });
      setDeleteDialogOpen(false);
      setSelectedDoc(null);
      loadDocuments();
    } catch (error: any) {
      toast({
        title: "Failed to delete document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = (doc: any) => {
    // In a real app, this would download from storage
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.name;
    link.click();
    toast({
      title: "Download started",
      description: `Downloading ${doc.name}`,
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <FileImage className="h-8 w-8 text-primary" />;
    if (type === "application/pdf") return <FileText className="h-8 w-8 text-destructive" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const getCategoryCount = (category: string) => {
    return documents.filter((doc) => doc.tags?.includes(category)).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">Secure family document storage</p>
          </div>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedCategory && (
            <Button variant="outline" onClick={() => setSelectedCategory(null)}>
              Clear Filter
            </Button>
          )}
        </div>

        {/* Categories */}
        <div className="grid gap-6 md:grid-cols-5">
          {categories.map((category) => (
            <Card
              key={category.name}
              className="cursor-pointer hover:shadow-medium transition-shadow"
              onClick={() => setSelectedCategory(category.name)}
            >
              <CardHeader>
                <category.icon className={`h-8 w-8 ${category.color} mb-2`} />
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription>{getCategoryCount(category.name)} documents</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Documents Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Documents</CardTitle>
            <CardDescription>
              {selectedCategory ? `Showing ${selectedCategory} documents` : "All uploaded files"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDocs.length === 0 ? (
              <EmptyState
                icon={FileText}
                title={searchQuery || selectedCategory ? "No documents found" : "No documents uploaded yet"}
                description={
                  searchQuery || selectedCategory
                    ? "Try adjusting your search or filter"
                    : "Upload your first document to get started"
                }
                actionLabel={!searchQuery && !selectedCategory ? "Upload Document" : undefined}
                onAction={() => setUploadDialogOpen(true)}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredDocs.map((doc) => (
                  <Card key={doc.id} className="p-4 hover:shadow-medium transition-shadow">
                    <div className="flex items-start gap-3">
                      {getFileIcon(doc.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setPreviewDialogOpen(true);
                        }}
                      >
                        <Eye className="mr-2 h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(doc)}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document to your family's secure storage
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FileUpload
              onFileSelect={(file, preview) => setUploadFile({ file, preview })}
              accept="image/*,application/pdf"
              maxSize={10}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma-separated)</label>
              <Input
                placeholder="Medical, Insurance, 2024..."
                value={docTags}
                onChange={(e) => setDocTags(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Add tags to organize your documents (e.g., Medical, Education, Financial)
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.name}</DialogTitle>
            <DialogDescription>
              Uploaded on {selectedDoc && new Date(selectedDoc.createdAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center min-h-[400px] bg-muted/30 rounded-lg">
            {selectedDoc?.type.startsWith("image/") ? (
              <img
                src={selectedDoc.fileUrl}
                alt={selectedDoc.name}
                className="max-w-full max-h-[600px] object-contain"
              />
            ) : selectedDoc?.type === "application/pdf" ? (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  PDF preview not available. Click download to view the file.
                </p>
                <Button className="mt-4" onClick={() => handleDownload(selectedDoc)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <div className="text-center p-8">
                <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Preview not available for this file type</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDoc?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Documents;
