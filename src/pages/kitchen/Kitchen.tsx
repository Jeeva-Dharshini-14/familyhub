import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UtensilsCrossed, Plus, Trash2, ShoppingCart, Calendar } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Kitchen = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [pantryDialogOpen, setPantryDialogOpen] = useState(false);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [mealForm, setMealForm] = useState({
    day: "",
    meal: "",
    recipe: "",
  });
  const [pantryForm, setPantryForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    expiryDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!user?.familyId) return;
      const [meals, pantry] = await Promise.all([
        apiService.getMealPlans(user.familyId),
        apiService.getPantryItems(user.familyId),
      ]);
      setMealPlans(meals);
      setPantryItems(pantry);
    } catch (error) {
      console.error("Failed to load kitchen data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    try {
      if (!mealForm.day || !mealForm.meal || !mealForm.recipe) {
        toast({
          title: "Missing fields",
          description: "Please fill all fields",
          variant: "destructive",
        });
        return;
      }

      await apiService.addMealPlan({
        familyId: user?.familyId,
        ...mealForm,
      });

      toast({
        title: "Meal added",
        description: "Meal plan has been updated",
      });

      setMealDialogOpen(false);
      setMealForm({ day: "", meal: "", recipe: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to add meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddPantry = async () => {
    try {
      if (!pantryForm.name || !pantryForm.quantity) {
        toast({
          title: "Missing fields",
          description: "Please fill required fields",
          variant: "destructive",
        });
        return;
      }

      await apiService.addPantryItem({
        familyId: user?.familyId,
        ...pantryForm,
      });

      toast({
        title: "Item added",
        description: "Pantry item has been added",
      });

      setPantryDialogOpen(false);
      setPantryForm({ name: "", quantity: "", unit: "", expiryDate: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await apiService.deleteMealPlan(id);
      toast({ title: "Meal removed" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePantry = async (id: string) => {
    try {
      await apiService.deletePantryItem(id);
      toast({ title: "Item removed" });
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
        <h1 className="text-3xl font-bold tracking-tight">Kitchen & Meals</h1>
        <p className="text-muted-foreground">Plan meals and manage your pantry</p>
      </div>

      <Tabs defaultValue="meals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="meals">Meal Planner</TabsTrigger>
          <TabsTrigger value="pantry">Pantry</TabsTrigger>
        </TabsList>

        <TabsContent value="meals" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Plan Meal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Plan a Meal</DialogTitle>
                  <DialogDescription>Add a meal to your weekly plan</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Input
                      placeholder="Monday, Tuesday..."
                      value={mealForm.day}
                      onChange={(e) => setMealForm({ ...mealForm, day: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meal Time</Label>
                    <Input
                      placeholder="Breakfast, Lunch, Dinner..."
                      value={mealForm.meal}
                      onChange={(e) => setMealForm({ ...mealForm, meal: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Recipe</Label>
                    <Input
                      placeholder="What's cooking?"
                      value={mealForm.recipe}
                      onChange={(e) => setMealForm({ ...mealForm, recipe: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMealDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddMeal}>Add Meal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {mealPlans.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No meals planned"
              description="Start planning your weekly meals"
              actionLabel="Plan Meal"
              onAction={() => setMealDialogOpen(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mealPlans.map((meal) => (
                <Card key={meal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{meal.recipe}</CardTitle>
                        <CardDescription>
                          {meal.day} - {meal.meal}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteMeal(meal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pantry" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={pantryDialogOpen} onOpenChange={setPantryDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Pantry Item</DialogTitle>
                  <DialogDescription>Track what's in your kitchen</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input
                      placeholder="Rice, Pasta, Milk..."
                      value={pantryForm.name}
                      onChange={(e) => setPantryForm({ ...pantryForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        placeholder="5"
                        value={pantryForm.quantity}
                        onChange={(e) => setPantryForm({ ...pantryForm, quantity: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        placeholder="kg, lbs, pcs..."
                        value={pantryForm.unit}
                        onChange={(e) => setPantryForm({ ...pantryForm, unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date (optional)</Label>
                    <Input
                      type="date"
                      value={pantryForm.expiryDate}
                      onChange={(e) => setPantryForm({ ...pantryForm, expiryDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPantryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPantry}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {pantryItems.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="Pantry is empty"
              description="Start tracking your pantry items"
              actionLabel="Add Item"
              onAction={() => setPantryDialogOpen(true)}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pantryItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>
                          {item.quantity} {item.unit}
                          {item.expiryDate && (
                            <span className="block text-xs mt-1">
                              Expires: {new Date(item.expiryDate).toLocaleDateString()}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePantry(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Kitchen;
