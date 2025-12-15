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
  const [formData, setFormData] = useState({
    memberId: "",
    name: "",
    url: "",
    price: "",
    priority: "medium",
  });

  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      if (!user?.familyId) return;
      const familyMembers = await apiService.getMembers(user.familyId);
      setMembers(familyMembers);
      
      // Set default member to first member if not set
      if (!formData.memberId && familyMembers.length > 0) {
        setFormData(prev => ({ ...prev, memberId: familyMembers[0].id }));
      }
    } catch (error) {
      console.error("Failed to load members:", error);
      setMembers([]);
    }
  };

  const loadData = () => {
    try {
      // Load from localStorage
      const savedItems = localStorage.getItem(`wishlist_${user?.familyId || 'demo'}`);
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
      setItems([]);
    }
  };

  const saveData = (newItems: any[]) => {
    try {
      localStorage.setItem(`wishlist_${user?.familyId || 'demo'}`, JSON.stringify(newItems));
    } catch (error) {
      console.error("Failed to save wishlist:", error);
    }
  };

  const handleAdd = () => {
    try {
      if (!formData.memberId || !formData.name) {
        toast({
          title: "Missing fields",
          description: "Please fill in member and item name",
          variant: "destructive",
        });
        return;
      }

      const newItem = {
        id: Date.now().toString(),
        familyId: user?.familyId || 'demo',
        memberId: formData.memberId,
        name: formData.name,
        url: formData.url || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        currency: "USD",
        priority: formData.priority,
        purchased: false,
        createdAt: new Date().toISOString(),
      };
      
      const newItems = [...items, newItem];
      setItems(newItems);
      saveData(newItems);

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
    } catch (error: any) {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = (itemId: string) => {
    try {
      const newItems = items.filter(item => item.id !== itemId);
      setItems(newItems);
      saveData(newItems);
      
      toast({
        title: "Item deleted",
        description: "Wishlist item has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTogglePurchased = (itemId: string) => {
    try {
      const newItems = items.map(item => 
        item.id === itemId 
          ? { ...item, purchased: !item.purchased, purchasedAt: !item.purchased ? new Date().toISOString() : undefined }
          : item
      );
      setItems(newItems);
      saveData(newItems);
      
      const item = items.find(i => i.id === itemId);
      toast({
        title: item?.purchased ? "Marked as unpurchased" : "Marked as purchased",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wishlist</h1>
          <p className="text-muted-foreground">Track family wishes and gift ideas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (open && !formData.memberId && members.length > 0) {
            setFormData(prev => ({ ...prev, memberId: members[0].id }));
          }
        }}>
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
                <Label>Item Name</Label>
                <Input
                  placeholder="What do they want?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>URL (optional)</Label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Price (optional)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
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
              <Button onClick={handleAdd}>Add Item</Button>
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
              <Card key={item.id} className={item.purchased ? "opacity-60" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.purchased && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Purchased
                          </Badge>
                        )}
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
                        variant={item.purchased ? "outline" : "default"}
                        onClick={() => handleTogglePurchased(item.id)}
                      >
                        {item.purchased ? "Unpurchase" : "Mark Purchased"}
                      </Button>
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