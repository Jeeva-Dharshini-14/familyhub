import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { authUtils } from "@/lib/auth";
import { apiService } from "@/lib/apiService";
import { toast } from "@/hooks/use-toast";

// Firebase direct request function
const FIREBASE_URL = "https://familyhub-96a91-default-rtdb.asia-southeast1.firebasedatabase.app";
const firebaseRequest = async (path: string, options: RequestInit = {}) => {
  const url = `${FIREBASE_URL}${path}.json`;
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error(`Firebase error: ${response.status}`);
  return response.json();
};

const Onboarding = () => {
  const navigate = useNavigate();
  const user = authUtils.getAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 3;

  const [familyData, setFamilyData] = useState({
    name: `${user?.name}'s Family`,
    avatar: ""
  });

  const [members, setMembers] = useState([
    {
      name: user?.name || "",
      age: "",
      relationship: "",
      role: "owner",
      email: "",
      password: "",
      createLogin: false
    }
  ]);

  const [walletData, setWalletData] = useState({
    name: "Family Wallet",
    balance: "0"
  });

  const progress = (step / totalSteps) * 100;

  const addMember = () => {
    setMembers([...members, {
      name: "",
      age: "",
      relationship: "child",
      role: "child",
      email: "",
      password: "",
      createLogin: false
    }]);
  };

  const removeMember = (index: number) => {
    if (index === 0) return; // Can't remove owner
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: string, value: string | boolean) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Create family if it doesn't exist
      let currentFamilyId = user?.familyId;
      if (!currentFamilyId) {
        const newFamily = await apiService.createFamily({
          name: familyData.name,
          avatar: familyData.avatar
        }, user?.id);
        currentFamilyId = newFamily.id;
        
        // Update user with family ID in both auth and database
        const updatedUser = { ...user, familyId: currentFamilyId };
        authUtils.setAuth(updatedUser as any);
        
        // Update user in database
        await apiService.updateUser(user?.id, { familyId: currentFamilyId });
      } else {
        // Update existing family name
        await apiService.updateFamily(currentFamilyId, {
          name: familyData.name,
          avatar: familyData.avatar
        });
      }

      // Check if owner member already exists, if not create one
      const existingMembers = await apiService.getMembers(currentFamilyId);
      let ownerMemberId = user?.memberId;
      
      if (!existingMembers.find(m => m.role === 'owner')) {
        const ownerMember = members[0];
        const createdMember = await apiService.addMember({
          familyId: currentFamilyId,
          name: ownerMember.name,
          age: parseInt(ownerMember.age) || 30,
          relationship: "owner",
          role: "owner",
          email: ownerMember.email,
          permissions: {
            finance: true,
            health: true,
            docs: true,
            study: true,
            tasks: true,
            meals: true,
            trips: true,
            settings: true
          }
        });
        ownerMemberId = createdMember.id;
      }
      
      // Update user with memberId - only update specific fields
      const finalUser = { ...user, familyId: currentFamilyId, memberId: ownerMemberId };
      authUtils.setAuth(finalUser as any);
      
      // Only update familyId and memberId, preserve existing user data
      await firebaseRequest(`/users/${user?.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          familyId: currentFamilyId, 
          memberId: ownerMemberId,
          updatedAt: new Date().toISOString()
        }),
      });
      
      // Add additional members (skip first one as it's the owner)
      for (let i = 1; i < members.length; i++) {
        const member = members[i];
        if (member.name.trim()) {
          const newMember = await apiService.addMember({
            familyId: currentFamilyId,
            name: member.name,
            age: parseInt(member.age) || 0,
            relationship: member.relationship,
            role: member.role,
            email: member.email,
            permissions: {
              finance: member.role === 'adult',
              health: member.role !== 'guest',
              docs: member.role === 'adult',
              study: member.role !== 'guest',
              tasks: member.role !== 'guest',
              meals: true,
              trips: member.role !== 'guest',
              settings: false
            }
          });
          
          // Create login account if requested
          if (member.createLogin && member.email && member.password) {
            try {
              await apiService.createMemberAccount({
                name: member.name,
                email: member.email,
                password: member.password,
                familyId: currentFamilyId,
                memberId: newMember.id,
                role: member.role,
              });
            } catch (error: any) {
              console.error(`Failed to create login for ${member.name}:`, error);
            }
          }
        }
      }

      // Create initial wallet
      await apiService.addWallet({
        familyId: currentFamilyId,
        name: walletData.name,
        balance: parseFloat(walletData.balance) || 0,
        currency: "USD",
        isShared: true
      });

      toast({
        title: "Setup Complete!",
        description: "Your family hub is ready to use."
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete setup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome to FamilyHub!</h1>
          <p className="text-center text-muted-foreground">Let's set up your family in a few simple steps</p>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>
              {step === 1 && "Family Information"}
              {step === 2 && "Add Family Members"}
              {step === 3 && "Initial Setup"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your family"}
              {step === 2 && "Add your family members (optional)"}
              {step === 3 && "Set up your initial wallet (optional)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyName">Family Name</Label>
                  <Input
                    id="familyName"
                    value={familyData.name}
                    onChange={(e) => setFamilyData({ ...familyData, name: e.target.value })}
                    placeholder="The Smith Family"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Family Members</h3>
                  <Button onClick={addMember} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {members.map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {index === 0 ? "You (Owner)" : `Member ${index + 1}`}
                        </h4>
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={member.name}
                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                            placeholder="Full name"
                            disabled={index === 0}
                          />
                        </div>
                        <div>
                          <Label>Age</Label>
                          <Input
                            type="number"
                            value={member.age}
                            onChange={(e) => updateMember(index, 'age', e.target.value)}
                            placeholder="Age"
                          />
                        </div>
                        <div>
                          <Label>Relationship</Label>
                          <Select
                            value={member.relationship}
                            onValueChange={(value) => updateMember(index, 'relationship', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select relationship" />
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
                        <div>
                          <Label>Role</Label>
                          <Select
                            value={member.role}
                            onValueChange={(value) => updateMember(index, 'role', value)}
                            disabled={index === 0}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="adult">Adult</SelectItem>
                              <SelectItem value="teen">Teen</SelectItem>
                              <SelectItem value="child">Child</SelectItem>
                              <SelectItem value="guest">Guest</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {index > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`login-${index}`}
                              checked={member.createLogin || false}
                              onChange={(e) => updateMember(index, 'createLogin', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`login-${index}`} className="text-sm font-medium">
                              Create login account for this member
                            </Label>
                          </div>
                          
                          {member.createLogin && (
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Login Email *</Label>
                                <Input
                                  type="email"
                                  value={member.email}
                                  onChange={(e) => updateMember(index, 'email', e.target.value)}
                                  placeholder={`${member.name.toLowerCase().replace(' ', '')}@family.com`}
                                  required
                                />
                              </div>
                              <div>
                                <Label>Password *</Label>
                                <Input
                                  type="password"
                                  value={member.password}
                                  onChange={(e) => updateMember(index, 'password', e.target.value)}
                                  placeholder="password123"
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Initial Wallet Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up your family wallet with an initial balance (you can add more wallets later)
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Wallet Name</Label>
                      <Input
                        value={walletData.name}
                        onChange={(e) => setWalletData({ ...walletData, name: e.target.value })}
                        placeholder="Family Wallet"
                      />
                    </div>
                    <div>
                      <Label>Initial Balance</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={walletData.balance}
                        onChange={(e) => setWalletData({ ...walletData, balance: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <h4 className="font-medium">What's included:</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                    <li>• Default expense categories (Groceries, Utilities, etc.)</li>
                    <li>• Task and reward system</li>
                    <li>• Health tracking setup</li>
                    <li>• Document storage</li>
                    <li>• Family calendar</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            <Button onClick={handleNext} disabled={loading}>
              {loading ? "Setting up..." : step < 3 ? "Continue" : "Complete Setup"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;