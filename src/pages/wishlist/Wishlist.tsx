import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Gift, Plus, Trash2, ExternalLink, Check } from "lucide-react";
import { authUtils } from "@/lib/auth";
import { apiService } from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";

const Wishlist = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    memberId: "",
    name: "",
    url: "",
    price: "",
    priority: "medium",
  });

  useEffect(() => {
    loadData();
    loadMembers();
  }, []);

  const loadData = async () => {
    try {
      if (!user?.familyId) return;
      const wishlistItems = await apiService.getWishlistItems(user.familyId);
      setItems(wishlistItems || []);
    } catch (error) {
      setItems([]);
    }
  };

  const loadMembers = async () => {
    try {
      if (!user?.familyId) return;
      const familyMembers = await apiService.getMembers(user.familyId);
      setMembers(familyMembers || []);
      if (familyMembers && familyMembers.length > 0) {
        setFormData(prev => ({ ...prev, memberId: familyMembers[0].id }));
      }
    } catch (error) {
      setMembers([]);
    }
  };

  const handleAdd = async () => {
    if (!formData.memberId || !formData.name) {
      toast({
        title: "Missing fields",
        description: "Please fill in member and item name",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const itemData = {
        familyId: user?.familyId,
        memberId: formData.memberId,
        name: formData.name,
        url: formData.url || "",
        price: formData.price ? parseFloat(formData.price) : 0,
        priority: formData.priority,
      };
      
      await apiService.addWishlistItem(itemData);

      toast({
        title: "Item added",
        description: "Wishlist item has been added successfully",
      });

      setDialogOpen(false);
      setFormData({
        memberId: members[0]?.id || "",
        name: "",
        url: "",
        price: "",
        priority: "medium",
      });
      
      await loadData();
    } catch (error: any) {
      toast({
        title: "Failed to add item",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await apiService.deleteWishlistItem(itemId);
      toast({
        title: "Item deleted",
        description: "Wishlist item has been removed",
      });
      await loadData();
    } catch (error: any) {
      toast({
        title: "Failed to delete item",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wishlist</h1>
          <p className="text-muted-foreground">Track family wishes and gift ideas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Wishlist Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Family Member</Label>
                <Select value={formData.memberId} onValueChange={(val) => setFormData(prev => ({ ...prev, memberId: val }))}>
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
                <Label>Item Name</Label>
                <Input
                  placeholder="What do they want?"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>URL (optional)</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (optional)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(val) => setFormData(prev => ({ ...prev, priority: val }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={loading}>
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No items in wishlist</h3>
              <p className="text-muted-foreground mb-4">Add items your family members wish for</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Item
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const member = members.find(m => m.id === item.memberId);
            return (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        For: {member?.name || 'Unknown'}
                      </p>
                      {item.price && (
                        <p className="text-sm font-medium mb-2">
                          ${item.price.toFixed(2)}
                        </p>
                      )}
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          View item <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(item.id)}
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
    </div>
  );
};

export default Wishlist;