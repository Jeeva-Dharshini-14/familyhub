import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/apiService";
import { authUtils } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { Plus, FileText, Activity, Calendar, Pill, Syringe, Heart, Users, File } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import HealthFamily from "./HealthFamily";
import HealthDocuments from "./HealthDocuments";

const Health = () => {
  const user = authUtils.getAuth();
  const [loading, setLoading] = useState(true);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [recordType, setRecordType] = useState<"prescription" | "vitals" | "vaccination">("vitals");
  const [records, setRecords] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("records");
  const [formData, setFormData] = useState({
    memberId: "",
    title: "",
    description: "",
    type: "vitals",
    bloodPressure: { systolic: "", diastolic: "" },
    heartRate: "",
    temperature: "",
  });

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      if (!user?.familyId) return;

      // Load records first
      const recordsData = await apiService.getHealthRecords(user.familyId);
      setRecords(recordsData);
      
      // Then load members
      const membersData = await apiService.getMembers(user.familyId);
      setMembers(membersData);

      if (user.memberId) {
        setFormData(prev => ({ ...prev, memberId: user.memberId }));
      }
    } catch (error) {
      console.error("Failed to load health data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    try {
      if (!formData.memberId) {
        toast({
          title: "Missing fields",
          description: "Please select a family member",
          variant: "destructive",
        });
        return;
      }

      const recordData: any = {
        familyId: user?.familyId,
        memberId: formData.memberId,
        type: recordType,
        title: formData.title || (recordType === "vitals" ? "Vitals Check" : "Health Record"),
        description: formData.description,
        date: new Date().toISOString(),
        tags: [],
      };

      if (recordType === "vitals") {
        recordData.data = {
          bloodPressure: formData.bloodPressure.systolic && formData.bloodPressure.diastolic
            ? { systolic: parseInt(formData.bloodPressure.systolic), diastolic: parseInt(formData.bloodPressure.diastolic) }
            : undefined,
          heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        };
      }

      await apiService.addHealthRecord(recordData);

      toast({
        title: "Record added",
        description: "Health record has been saved successfully",
      });

      setRecordDialogOpen(false);
      setFormData({
        memberId: user?.memberId || "",
        title: "",
        description: "",
        type: "vitals",
        bloodPressure: { systolic: "", diastolic: "" },
        heartRate: "",
        temperature: "",
      });
      
      loadHealthData();
    } catch (error: any) {
      toast({
        title: "Failed to add record",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Health</h1>
          <p className="text-muted-foreground">Track family health records and vitals</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="family">Family Health</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Health Record</DialogTitle>
                  <DialogDescription>Record health information for a family member</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Record Type</Label>
                    <Select value={recordType} onValueChange={(val: any) => setRecordType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vitals">Vitals</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                      </SelectContent>
                    </Select>
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

                  {recordType === "vitals" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Systolic BP</Label>
                          <Input
                            type="number"
                            placeholder="120"
                            value={formData.bloodPressure.systolic}
                            onChange={(e) => setFormData({
                              ...formData,
                              bloodPressure: { ...formData.bloodPressure, systolic: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Diastolic BP</Label>
                          <Input
                            type="number"
                            placeholder="80"
                            value={formData.bloodPressure.diastolic}
                            onChange={(e) => setFormData({
                              ...formData,
                              bloodPressure: { ...formData.bloodPressure, diastolic: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Heart Rate (bpm)</Label>
                        <Input
                          type="number"
                          placeholder="72"
                          value={formData.heartRate}
                          onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Temperature (°F)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="98.6"
                          value={formData.temperature}
                          onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          placeholder="Prescription name"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input
                          placeholder="Additional details..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRecordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRecord}>Add Record</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Health records stored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Being tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground mt-1">New records</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <CardHeader>
          <CardTitle>Health Records</CardTitle>
          <CardDescription>Recent health entries for your family</CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No health records yet</p>
              <Button variant="outline" onClick={() => setRecordDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add your first record
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const member = members.find(m => m.id === record.memberId);
                return (
                  <div key={record.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{record.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {member?.name} • {new Date(record.date).toLocaleDateString()}
                      </p>
                      {record.data && (
                        <div className="mt-2 text-sm">
                          {record.data.bloodPressure && (
                            <span className="mr-4">
                              BP: {record.data.bloodPressure.systolic}/{record.data.bloodPressure.diastolic}
                            </span>
                          )}
                          {record.data.heartRate && (
                            <span className="mr-4">HR: {record.data.heartRate} bpm</span>
                          )}
                          {record.data.temperature && (
                            <span>Temp: {record.data.temperature}°F</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="family">
          <HealthFamily />
        </TabsContent>

        <TabsContent value="documents">
          <HealthDocuments />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Health;
