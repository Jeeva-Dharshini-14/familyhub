// Mock API service with localStorage persistence and simulated delays

const STORAGE_KEY = "familyhub_data";
const API_DELAY = 300; // Simulated network delay in ms

// Utility to get data from localStorage
const getData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

// Utility to save data to localStorage
const saveData = (data: any) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, jsonData);
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.error("localStorage quota exceeded. Clearing old data...");
      // Try to free up space by removing file previews
      if (data.documents) {
        data.documents = data.documents.map((doc: any) => ({
          ...doc,
          fileUrl: doc.fileUrl?.length > 100 ? doc.fileUrl.substring(0, 100) + '...[truncated]' : doc.fileUrl
        }));
      }
      if (data.memories) {
        data.memories = data.memories.map((mem: any) => ({
          ...mem,
          photoUrl: '' // Remove photos to save space
        }));
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (retryError) {
        console.error("Failed to save even after cleanup:", retryError);
        throw new Error("Storage quota exceeded. Please clear some data.");
      }
    } else {
      console.error("Error saving to localStorage:", error);
      throw error;
    }
  }
};

// Simulate network delay
const delay = (ms: number = API_DELAY) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Random errors disabled for reliable operation
const maybeThrowError = () => {
  // No random errors - all operations should succeed
};

export const mockApi = {
  // Initialize demo data
  async initDemoData() {
    const existingData = getData();
    if (existingData) return existingData;

    const demoData = {
      users: [
        {
          id: "user-1",
          email: "owner@example.test",
          password: "demo123",
          name: "John Smith",
          familyId: "family-1",
          memberId: "member-1",
          role: "owner",
        },
        {
          id: "user-2",
          email: "adult@example.test",
          password: "demo123",
          name: "Jane Smith",
          familyId: "family-1",
          memberId: "member-2",
          role: "adult",
        },
        {
          id: "user-3",
          email: "teen@example.test",
          password: "demo123",
          name: "Alex Smith",
          familyId: "family-1",
          memberId: "member-3",
          role: "teen",
        },
      ],
      families: [
        {
          id: "family-1",
          name: "Smith Family",
          avatar: "",
          ownerId: "user-1",
          members: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      members: [
        {
          id: "member-1",
          familyId: "family-1",
          name: "John Smith",
          age: 42,
          dateOfBirth: "1982-05-15",
          gender: "male",
          relationship: "father",
          role: "owner",
          profileImage: "",
          email: "owner@example.test",
          permissions: {
            finance: true,
            health: true,
            docs: true,
            study: true,
            tasks: true,
            meals: true,
            trips: true,
            settings: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "member-2",
          familyId: "family-1",
          name: "Jane Smith",
          age: 40,
          dateOfBirth: "1984-08-22",
          gender: "female",
          relationship: "mother",
          role: "adult",
          profileImage: "",
          email: "adult@example.test",
          permissions: {
            finance: true,
            health: true,
            docs: true,
            study: true,
            tasks: true,
            meals: true,
            trips: true,
            settings: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "member-3",
          familyId: "family-1",
          name: "Alex Smith",
          age: 15,
          dateOfBirth: "2009-03-10",
          gender: "male",
          relationship: "son",
          role: "teen",
          profileImage: "",
          email: "teen@example.test",
          permissions: {
            finance: false,
            health: true,
            docs: false,
            study: true,
            tasks: true,
            meals: true,
            trips: true,
            settings: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      wallets: [
        {
          id: "wallet-1",
          familyId: "family-1",
          name: "Family Wallet",
          balance: 5000,
          currency: "USD",
          isShared: true,
          createdAt: new Date().toISOString(),
        },
      ],
      categories: [
        { id: "cat-1", familyId: "family-1", name: "Groceries", icon: "🛒", color: "#10b981", budget: 500 },
        { id: "cat-2", familyId: "family-1", name: "Utilities", icon: "⚡", color: "#f59e0b", budget: 300 },
        { id: "cat-3", familyId: "family-1", name: "Transport", icon: "🚗", color: "#3b82f6", budget: 200 },
        { id: "cat-4", familyId: "family-1", name: "Medical", icon: "❤️", color: "#ef4444", budget: 400 },
        { id: "cat-5", familyId: "family-1", name: "Education", icon: "📚", color: "#8b5cf6", budget: 300 },
        { id: "cat-6", familyId: "family-1", name: "Entertainment", icon: "🎬", color: "#ec4899", budget: 250 },
        { id: "cat-7", familyId: "family-1", name: "Dining Out", icon: "🍽️", color: "#f97316", budget: 300 },
      ],
      expenses: [],
      incomes: [],
      tasks: [],
      rewards: [
        { id: "reward-1", familyId: "family-1", name: "Movie Night", description: "Choose family movie", pointsCost: 50, icon: "Film", createdAt: new Date().toISOString() },
        { id: "reward-2", familyId: "family-1", name: "Extra Screen Time", description: "30 minutes extra", pointsCost: 30, icon: "Monitor", createdAt: new Date().toISOString() },
        { id: "reward-3", familyId: "family-1", name: "Favorite Meal", description: "Pick dinner menu", pointsCost: 40, icon: "Utensils", createdAt: new Date().toISOString() },
      ],
      redemptions: [],
      healthRecords: [],
      appointments: [],
      recipes: [],
      mealPlans: [],
      pantryItems: [],
      documents: [],
      calendarEvents: [],
      wishlist: [],
      memories: [],
      trips: [],
      assignments: [],
      notifications: [],
      memberPoints: {
        "member-3": 0,
      },
    };

    saveData(demoData);
    return demoData;
  },

  // Auth
  async login(email: string, password: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const user = data.users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = `demo-token-${user.id}-${Date.now()}`;
    return { ...user, token };
  },

  async register(userData: any) {
    await delay();
    const data = getData() || (await this.initDemoData());
    
    // Create minimal user setup - onboarding will complete the rest
    const familyId = `family-${Date.now()}`;
    const memberId = `member-${Date.now()}`;
    const userId = `user-${Date.now()}`;
    
    const newUser = {
      id: userId,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      familyId: familyId,
      memberId: memberId,
      role: "owner",
      token: `demo-token-${userId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    saveData(data);
    return newUser;
  },

  // Family
  async createFamily(familyData: any, userId?: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newFamily = {
      id: `family-${Date.now()}`,
      ...familyData,
      ownerId: userId || `user-${Date.now()}`,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.families.push(newFamily);
    saveData(data);

    return newFamily;
  },

  async getFamily(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.families.find((f: any) => f.id === familyId);
  },

  async updateFamily(familyId: string, updates: any) {
    await delay();
    const data = getData() || (await this.initDemoData());

    const familyIndex = data.families.findIndex((f: any) => f.id === familyId);
    if (familyIndex === -1) {
      // Create family if not found instead of throwing error
      const newFamily = {
        id: familyId,
        ...updates,
        ownerId: 'temp-owner',
        members: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      data.families.push(newFamily);
      saveData(data);
      return newFamily;
    }

    data.families[familyIndex] = {
      ...data.families[familyIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    saveData(data);
    return data.families[familyIndex];
  },

  // Members
  async addMember(memberData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newMember = {
      id: `member-${Date.now()}`,
      ...memberData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    data.members.push(newMember);
    if (!data.memberPoints[newMember.id]) {
      data.memberPoints[newMember.id] = 0;
    }
    saveData(data);

    return newMember;
  },

  async getMembers(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.members.filter((m: any) => m.familyId === familyId);
  },

  async getMember(memberId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.members.find((m: any) => m.id === memberId);
  },

  async updateMember(memberId: string, updates: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const index = data.members.findIndex((m: any) => m.id === memberId);
    if (index !== -1) {
      data.members[index] = { ...data.members[index], ...updates, updatedAt: new Date().toISOString() };
      saveData(data);
      return data.members[index];
    }
    throw new Error("Member not found");
  },

  // Expenses
  async addExpense(expenseData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newExpense = {
      id: `expense-${Date.now()}`,
      ...expenseData,
      createdAt: new Date().toISOString(),
    };

    data.expenses.push(newExpense);
    
    // Update wallet balance
    const wallet = data.wallets.find((w: any) => w.id === expenseData.walletId);
    if (wallet) {
      wallet.balance -= expenseData.amount;
    }

    saveData(data);
    return newExpense;
  },

  async getExpenses(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.expenses.filter((e: any) => e.familyId === familyId);
  },

  // Income
  async addIncome(incomeData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    if (!data.incomes) {
      data.incomes = [];
    }

    const newIncome = {
      id: `income-${Date.now()}`,
      ...incomeData,
      createdAt: new Date().toISOString(),
    };

    data.incomes.push(newIncome);
    
    // Update wallet balance
    const wallet = data.wallets.find((w: any) => w.id === incomeData.walletId);
    if (wallet) {
      wallet.balance += incomeData.amount;
    }

    saveData(data);
    return newIncome;
  },

  async getIncomes(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    if (!data.incomes) {
      return [];
    }
    return data.incomes.filter((i: any) => i.familyId === familyId);
  },

  // Tasks
  async addTask(taskData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newTask = {
      id: `task-${Date.now()}`,
      ...taskData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    data.tasks.push(newTask);
    saveData(data);
    return newTask;
  },

  async getTasks(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.tasks.filter((t: any) => t.familyId === familyId);
  },

  async updateTask(taskId: string, updates: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const index = data.tasks.findIndex((t: any) => t.id === taskId);
    if (index !== -1) {
      data.tasks[index] = { ...data.tasks[index], ...updates };
      
      // Award points if approved
      if (updates.status === "approved" && data.tasks[index].assignedTo) {
        const assignedMemberId = data.tasks[index].assignedTo;
        data.memberPoints[assignedMemberId] = (data.memberPoints[assignedMemberId] || 0) + data.tasks[index].points;
      }
      
      saveData(data);
      return data.tasks[index];
    }
    throw new Error("Task not found");
  },

  async getMemberPoints(memberId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.memberPoints[memberId] || 0;
  },

  // Wallets
  async getWallets(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.wallets.filter((w: any) => w.familyId === familyId);
  },

  async addWallet(walletData: any) {
    await delay();
    // Remove error simulation for setup
    // maybeThrowError();

    const data = getData() || (await this.initDemoData());
    const newWallet = {
      id: `wallet-${Date.now()}`,
      ...walletData,
      createdAt: new Date().toISOString(),
    };

    data.wallets.push(newWallet);
    saveData(data);
    return newWallet;
  },

  updateWallet(walletId: string, updates: any) {
    const data = getData() || { wallets: [] };
    const index = data.wallets.findIndex((w: any) => w.id === walletId);
    if (index !== -1) {
      data.wallets[index] = { ...data.wallets[index], ...updates };
      saveData(data);
      return data.wallets[index];
    }
    throw new Error("Wallet not found");
  },

  async deleteWallet(walletId: string) {
    await delay();
    maybeThrowError();

    const data = getData() || (await this.initDemoData());
    data.wallets = data.wallets.filter((w: any) => w.id !== walletId);
    saveData(data);
  },

  deleteExpense(expenseId: string) {
    const data = getData();
    if (!data) return;
    const expense = data.expenses.find((e: any) => e.id === expenseId);
    if (expense) {
      const wallet = data.wallets.find((w: any) => w.id === expense.walletId);
      if (wallet) {
        wallet.balance += expense.amount;
      }
      data.expenses = data.expenses.filter((e: any) => e.id !== expenseId);
      saveData(data);
    }
  },

  deleteIncome(incomeId: string) {
    const data = getData();
    if (!data) return;
    const income = data.incomes.find((i: any) => i.id === incomeId);
    if (income) {
      const wallet = data.wallets.find((w: any) => w.id === income.walletId);
      if (wallet) {
        wallet.balance -= income.amount;
      }
      data.incomes = data.incomes.filter((i: any) => i.id !== incomeId);
      saveData(data);
    }
  },

  // Categories
  async getCategories(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.categories.filter((c: any) => c.familyId === familyId);
  },

  async addCategory(categoryData: any) {
    await delay();
    maybeThrowError();

    const data = getData() || (await this.initDemoData());
    const newCategory = {
      id: `cat-${Date.now()}`,
      ...categoryData,
      createdAt: new Date().toISOString(),
    };

    data.categories.push(newCategory);
    saveData(data);
    return newCategory;
  },

  // Health
  async addHealthRecord(recordData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newRecord = {
      id: `health-${Date.now()}`,
      ...recordData,
      createdAt: new Date().toISOString(),
    };

    data.healthRecords.push(newRecord);
    saveData(data);
    return newRecord;
  },

  async getHealthRecords(familyId: string, memberId?: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    let records = data.healthRecords.filter((r: any) => r.familyId === familyId);
    if (memberId) {
      records = records.filter((r: any) => r.memberId === memberId);
    }
    return records;
  },

  // Rewards
  async getRewards(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.rewards.filter((r: any) => r.familyId === familyId);
  },

  async redeemReward(rewardId: string, memberId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const reward = data.rewards.find((r: any) => r.id === rewardId);
    if (!reward) throw new Error("Reward not found");

    const currentPoints = data.memberPoints[memberId] || 0;
    if (currentPoints < reward.pointsCost) {
      throw new Error("Insufficient points");
    }

    data.memberPoints[memberId] -= reward.pointsCost;
    
    const redemption = {
      id: `redemption-${Date.now()}`,
      familyId: reward.familyId,
      memberId,
      rewardId,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date().toISOString(),
    };

    data.redemptions.push(redemption);
    saveData(data);
    return redemption;
  },

  // Notifications
  async getNotifications(userId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.notifications.filter((n: any) => n.userId === userId);
  },

  async markNotificationRead(notificationId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    const index = data.notifications.findIndex((n: any) => n.id === notificationId);
    if (index !== -1) {
      data.notifications[index].read = true;
      saveData(data);
      return data.notifications[index];
    }
    throw new Error("Notification not found");
  },

  async clearAllNotifications(userId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    data.notifications = data.notifications.filter((n: any) => n.userId !== userId);
    saveData(data);
    return true;
  },

  // Documents
  async uploadDocument(documentData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    
    // For demo purposes, truncate large file URLs to prevent localStorage quota issues
    let fileUrl = documentData.fileUrl;
    if (fileUrl && fileUrl.length > 50000) {
      // Keep only a small preview for very large files
      fileUrl = fileUrl.substring(0, 1000) + '...[file-too-large]';
    }
    
    const newDocument = {
      id: `doc-${Date.now()}`,
      ...documentData,
      fileUrl,
      createdAt: new Date().toISOString(),
    };

    data.documents.push(newDocument);
    try {
      saveData(data);
    } catch (error: any) {
      throw new Error("Failed to upload document. Storage quota exceeded. Please clear some old documents first.");
    }
    return newDocument;
  },

  async getDocuments(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.documents.filter((d: any) => d.familyId === familyId);
  },

  async deleteDocument(documentId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.documents = data.documents.filter((d: any) => d.id !== documentId);
    saveData(data);
  },

  // Calendar Events
  async addCalendarEvent(eventData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      createdAt: new Date().toISOString(),
    };

    data.calendarEvents.push(newEvent);
    saveData(data);
    return newEvent;
  },

  async getCalendarEvents(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.calendarEvents.filter((e: any) => e.familyId === familyId);
  },

  async updateCalendarEvent(eventId: string, updates: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const index = data.calendarEvents.findIndex((e: any) => e.id === eventId);
    if (index !== -1) {
      data.calendarEvents[index] = { ...data.calendarEvents[index], ...updates };
      saveData(data);
      return data.calendarEvents[index];
    }
    throw new Error("Event not found");
  },

  async deleteCalendarEvent(eventId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.calendarEvents = data.calendarEvents.filter((e: any) => e.id !== eventId);
    saveData(data);
  },

  // Member Management
  async deleteMember(memberId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.members = data.members.filter((m: any) => m.id !== memberId);
    delete data.memberPoints[memberId];
    saveData(data);
  },

  // User Profile
  async updateUser(userId: string, updates: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const userIndex = data.users.findIndex((u: any) => u.id === userId);
    if (userIndex !== -1) {
      data.users[userIndex] = { ...data.users[userIndex], ...updates };
      
      // Also update corresponding member if exists
      if (data.users[userIndex].memberId) {
        const memberIndex = data.members.findIndex((m: any) => m.id === data.users[userIndex].memberId);
        if (memberIndex !== -1) {
          data.members[memberIndex] = {
            ...data.members[memberIndex],
            name: updates.name || data.members[memberIndex].name,
            profileImage: updates.avatarUrl || data.members[memberIndex].profileImage,
            email: updates.email || data.members[memberIndex].email,
            phone: updates.phone || data.members[memberIndex].phone,
          };
        }
      }
      
      saveData(data);
      return data.users[userIndex];
    }
    throw new Error("User not found");
  },

  async getUser(userId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.users.find((u: any) => u.id === userId);
  },

  // Appointments
  async addAppointment(appointmentData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newAppointment = {
      id: `appt-${Date.now()}`,
      ...appointmentData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    data.appointments.push(newAppointment);
    saveData(data);
    return newAppointment;
  },

  async getAppointments(familyId: string, memberId?: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    let appointments = data.appointments.filter((a: any) => a.familyId === familyId);
    if (memberId) {
      appointments = appointments.filter((a: any) => a.memberId === memberId);
    }
    return appointments;
  },

  async updateAppointment(appointmentId: string, updates: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const index = data.appointments.findIndex((a: any) => a.id === appointmentId);
    if (index !== -1) {
      data.appointments[index] = { ...data.appointments[index], ...updates };
      saveData(data);
      return data.appointments[index];
    }
    throw new Error("Appointment not found");
  },

  // Wishlist
  async addWishlistItem(itemData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newItem = {
      id: `wish-${Date.now()}`,
      ...itemData,
      purchased: false,
      createdAt: new Date().toISOString(),
    };

    data.wishlist.push(newItem);
    saveData(data);
    return newItem;
  },

  async getWishlistItems(familyId: string, memberId?: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    let items = data.wishlist.filter((i: any) => i.familyId === familyId);
    if (memberId) {
      items = items.filter((i: any) => i.memberId === memberId);
    }
    return items;
  },

  async updateWishlistItem(itemId: string, updates: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const index = data.wishlist.findIndex((i: any) => i.id === itemId);
    if (index !== -1) {
      data.wishlist[index] = { ...data.wishlist[index], ...updates };
      saveData(data);
      return data.wishlist[index];
    }
    throw new Error("Wishlist item not found");
  },

  async deleteWishlistItem(itemId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.wishlist = data.wishlist.filter((i: any) => i.id !== itemId);
    saveData(data);
  },

  // Memories
  async addMemory(memoryData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    
    // Ensure memories array exists
    if (!data.memories) {
      data.memories = [];
    }
    
    const newMemory = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...memoryData,
      photoUrl: memoryData.photoUrl,
      createdAt: new Date().toISOString(),
    };

    data.memories.push(newMemory);
    try {
      saveData(data);
      return newMemory;
    } catch (error: any) {
      console.error("Failed to save memory:", error);
      // If quota exceeded, try without the photo
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        newMemory.photoUrl = '';
        data.memories[data.memories.length - 1] = newMemory;
        saveData(data);
        throw new Error("Photo too large. Memory saved without photo. Please use smaller images.");
      }
      throw new Error("Failed to save memory. Please try again.");
    }
  },

  async getMemories(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.memories.filter((m: any) => m.familyId === familyId);
  },

  async deleteMemory(memoryId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.memories = data.memories.filter((m: any) => m.id !== memoryId);
    saveData(data);
  },

  // Trips
  async addTrip(tripData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    
    // Ensure trips array exists
    if (!data.trips) {
      data.trips = [];
    }
    
    const newTrip = {
      id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...tripData,
      createdAt: new Date().toISOString(),
    };

    data.trips.push(newTrip);
    try {
      saveData(data);
      return newTrip;
    } catch (error: any) {
      console.error("Failed to save trip:", error);
      throw new Error("Failed to save trip. Please try again.");
    }
  },

  async getTrips(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.trips.filter((t: any) => t.familyId === familyId);
  },

  async deleteTrip(tripId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.trips = data.trips.filter((t: any) => t.id !== tripId);
    saveData(data);
  },

  // Meal Plans
  async addMealPlan(mealData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newMeal = {
      id: `meal-${Date.now()}`,
      ...mealData,
      createdAt: new Date().toISOString(),
    };

    data.mealPlans.push(newMeal);
    saveData(data);
    return newMeal;
  },

  async getMealPlans(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.mealPlans.filter((m: any) => m.familyId === familyId);
  },

  async deleteMealPlan(mealId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.mealPlans = data.mealPlans.filter((m: any) => m.id !== mealId);
    saveData(data);
  },

  // Pantry Items
  async addPantryItem(itemData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newItem = {
      id: `pantry-${Date.now()}`,
      ...itemData,
      createdAt: new Date().toISOString(),
    };

    data.pantryItems.push(newItem);
    saveData(data);
    return newItem;
  },

  async getPantryItems(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.pantryItems.filter((i: any) => i.familyId === familyId);
  },

  async deletePantryItem(itemId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.pantryItems = data.pantryItems.filter((i: any) => i.id !== itemId);
    saveData(data);
  },

  // Assignments (Study/Education)
  async addAssignment(assignmentData: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const newAssignment = {
      id: `assignment-${Date.now()}`,
      ...assignmentData,
      createdAt: new Date().toISOString(),
    };

    data.assignments.push(newAssignment);
    saveData(data);
    return newAssignment;
  },

  async getAssignments(familyId: string) {
    await delay();
    const data = getData() || (await this.initDemoData());
    return data.assignments.filter((a: any) => a.familyId === familyId);
  },

  async updateAssignment(assignmentId: string, updates: any) {
    await delay();

    const data = getData() || (await this.initDemoData());
    const index = data.assignments.findIndex((a: any) => a.id === assignmentId);
    if (index !== -1) {
      data.assignments[index] = { ...data.assignments[index], ...updates };
      saveData(data);
      return data.assignments[index];
    }
    throw new Error("Assignment not found");
  },

  async deleteAssignment(assignmentId: string) {
    await delay();

    const data = getData() || (await this.initDemoData());
    data.assignments = data.assignments.filter((a: any) => a.id !== assignmentId);
    saveData(data);
  },
};
