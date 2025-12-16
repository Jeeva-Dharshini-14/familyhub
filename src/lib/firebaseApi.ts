// Firebase API service for direct Firebase Realtime Database connection

const FIREBASE_URL = "https://familyhub-96a91-default-rtdb.asia-southeast1.firebasedatabase.app";

// Utility to make Firebase REST API calls
const firebaseRequest = async (path: string, options: RequestInit = {}) => {
  const url = `${FIREBASE_URL}${path}.json`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add timeout for production
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Firebase error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
};

export const firebaseApi = {
  // Auth
  async register(userData: any) {
    const userId = `user-${Date.now()}`;
    const familyId = `family-${Date.now()}`;
    const memberId = `member-${Date.now()}`;
    const familyName = userData.familyName || `${userData.name}'s Family`;
    const now = new Date().toISOString();
    
    const newUser = {
      id: userId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      familyId: familyId,
      familyName: familyName,
      memberId: memberId,
      role: "owner",
      token: `firebase-token-${userId}-${Date.now()}`,
      phone: userData.phone || null,
      avatarUrl: userData.avatarUrl || null,
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    await firebaseRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(newUser),
    });

    // Create family record
    await this.createFamily({
      name: familyName,
      avatar: userData.avatarUrl,
    }, userId);

    // Create member record with proper age
    const age = userData.age || 30;
    const birthYear = new Date().getFullYear() - age;
    await this.addMember({
      familyId: familyId,
      name: userData.name,
      age: age,
      dateOfBirth: `${birthYear}-01-01`,
      gender: userData.gender || 'prefer-not-to-say',
      relationship: 'owner',
      role: 'owner',
      profileImage: userData.avatarUrl,
      email: userData.email,
      phone: userData.phone,
      permissions: {
        finance: true,
        health: true,
        docs: true,
        study: true,
        tasks: true,
        meals: true,
        trips: true,
      },
    });

    return newUser;
  },

  async login(email: string, password: string) {
    const users = await firebaseRequest('/users');
    if (!users) throw new Error("No users found");
    
    const user = Object.values(users).find(
      (u: any) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = `firebase-token-${(user as any).id}-${Date.now()}`;
    return { ...user, token };
  },

  // Family
  async createFamily(familyData: any, userId?: string) {
    const familyId = `family-${Date.now()}`;
    const newFamily = {
      id: familyId,
      ...familyData,
      ownerId: userId || `user-${Date.now()}`,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firebaseRequest(`/families/${familyId}`, {
      method: 'PUT',
      body: JSON.stringify(newFamily),
    });

    return newFamily;
  },

  async getFamily(familyId: string) {
    return await firebaseRequest(`/families/${familyId}`);
  },

  async updateFamily(familyId: string, updates: any) {
    const updatedFamily = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await firebaseRequest(`/families/${familyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedFamily),
    });

    return updatedFamily;
  },

  // Members
  async addMember(memberData: any) {
    const memberId = `member-${Date.now()}`;
    const newMember = {
      id: memberId,
      ...memberData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firebaseRequest(`/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(newMember),
    });

    return newMember;
  },

  async getMembers(familyId: string) {
    const members = await firebaseRequest('/members');
    if (!members) return [];
    
    return Object.values(members).filter((m: any) => m.familyId === familyId);
  },

  // Wallets
  async addWallet(walletData: any) {
    const walletId = `wallet-${Date.now()}`;
    const newWallet = {
      id: walletId,
      ...walletData,
      initialBalance: walletData.balance || 0,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/wallets/${walletId}`, {
      method: 'PUT',
      body: JSON.stringify(newWallet),
    });

    return newWallet;
  },

  async getWallets(familyId: string) {
    const wallets = await firebaseRequest('/wallets');
    if (!wallets) return [];
    
    return Object.values(wallets).filter((w: any) => w.familyId === familyId);
  },

  // User Profile
  async updateUser(userId: string, updates: any) {
    try {
      // Get existing user data first
      const existingUser = await firebaseRequest(`/users/${userId}`);
      
      if (existingUser) {
        // Merge updates with existing data, preserving all original fields
        const updatedUser = {
          ...existingUser,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await firebaseRequest(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(updatedUser),
        });

        return updatedUser;
      } else {
        // User doesn't exist, create with updates only
        const newUser = {
          id: userId,
          ...updates,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await firebaseRequest(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(newUser),
        });

        return newUser;
      }
    } catch (error) {
      // If user doesn't exist, create with updates
      const newUser = {
        id: userId,
        ...updates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await firebaseRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(newUser),
      });

      return newUser;
    }
  },

  // Tasks
  async getTasks(familyId: string) {
    const tasks = await firebaseRequest('/tasks');
    if (!tasks) return [];
    
    return Object.values(tasks).filter((t: any) => t.familyId === familyId);
  },

  // Health Records
  async getHealthRecords(familyId: string) {
    const records = await firebaseRequest('/healthRecords');
    if (!records) return [];
    
    return Object.values(records).filter((r: any) => r.familyId === familyId);
  },

  // Expenses
  async getExpenses(familyId: string) {
    const expenses = await firebaseRequest('/expenses');
    if (!expenses) return [];
    
    return Object.values(expenses).filter((e: any) => e.familyId === familyId);
  },

  async addExpense(expenseData: any) {
    const expenseId = `expense-${Date.now()}`;
    const newExpense = {
      id: expenseId,
      ...expenseData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(newExpense),
    });

    // Don't update wallet balance - calculate from transactions
    return newExpense;
  },

  // Tasks
  async addTask(taskData: any) {
    const taskId = `task-${Date.now()}`;
    const newTask = {
      id: taskId,
      ...taskData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(newTask),
    });

    return newTask;
  },

  async updateTask(taskId: string, updates: any) {
    try {
      // Get existing task data first
      const existingTask = await firebaseRequest(`/tasks/${taskId}`);
      
      if (existingTask) {
        // Merge updates with existing data
        const updatedTask = {
          ...existingTask,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await firebaseRequest(`/tasks/${taskId}`, {
          method: 'PUT',
          body: JSON.stringify(updatedTask),
        });

        return updatedTask;
      } else {
        throw new Error("Task not found");
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Health Records
  async addHealthRecord(recordData: any) {
    const recordId = `health-${Date.now()}`;
    const newRecord = {
      id: recordId,
      ...recordData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/healthRecords/${recordId}`, {
      method: 'PUT',
      body: JSON.stringify(newRecord),
    });

    return newRecord;
  },

  // Categories
  async getCategories(familyId: string) {
    const categories = await firebaseRequest('/categories');
    if (!categories) return [];
    
    return Object.values(categories).filter((c: any) => c.familyId === familyId);
  },

  async addCategory(categoryData: any) {
    const categoryId = `cat-${Date.now()}`;
    const newCategory = {
      id: categoryId,
      ...categoryData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(newCategory),
    });

    return newCategory;
  },

  // Documents
  async uploadDocument(documentData: any) {
    const docId = `doc-${Date.now()}`;
    const newDocument = {
      id: docId,
      ...documentData,
      createdAt: new Date().toISOString(),
    };

    // Remove any artificial delays - upload immediately
    const result = await firebaseRequest(`/documents/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(newDocument),
    });

    return newDocument;
  },

  async getDocuments(familyId: string) {
    const documents = await firebaseRequest('/documents');
    if (!documents) return [];
    
    return Object.values(documents).filter((d: any) => d.familyId === familyId);
  },

  // Calendar Events
  async addCalendarEvent(eventData: any) {
    const eventId = `event-${Date.now()}`;
    const newEvent = {
      id: eventId,
      ...eventData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/calendarEvents/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(newEvent),
    });

    return newEvent;
  },

  async getCalendarEvents(familyId: string) {
    const events = await firebaseRequest('/calendarEvents');
    if (!events) return [];
    
    return Object.values(events).filter((e: any) => e.familyId === familyId);
  },

  // Meal Plans
  async addMealPlan(mealData: any) {
    const mealId = `meal-${Date.now()}`;
    const newMeal = {
      id: mealId,
      ...mealData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/mealPlans/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(newMeal),
    });

    return newMeal;
  },

  async getMealPlans(familyId: string) {
    const meals = await firebaseRequest('/mealPlans');
    if (!meals) return [];
    
    return Object.values(meals).filter((m: any) => m.familyId === familyId);
  },

  // Pantry Items
  async addPantryItem(itemData: any) {
    const itemId = `pantry-${Date.now()}`;
    const newItem = {
      id: itemId,
      ...itemData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/pantryItems/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(newItem),
    });

    return newItem;
  },

  async getPantryItems(familyId: string) {
    const items = await firebaseRequest('/pantryItems');
    if (!items) return [];
    
    return Object.values(items).filter((i: any) => i.familyId === familyId);
  },

  // Rewards
  async getRewards(familyId: string) {
    const rewards = await firebaseRequest('/rewards');
    if (!rewards) return [];
    
    return Object.values(rewards).filter((r: any) => r.familyId === familyId);
  },

  // Member Points
  async getMemberPoints(memberId: string) {
    const points = await firebaseRequest(`/memberPoints/${memberId}`);
    return points || 0;
  },

  // Notifications
  async getNotifications(userId: string) {
    const notifications = await firebaseRequest('/notifications');
    if (!notifications) return [];
    
    return Object.values(notifications).filter((n: any) => n.userId === userId);
  },

  // Wishlist
  async getWishlistItems(familyId: string) {
    const items = await firebaseRequest('/wishlist');
    if (!items) return [];
    
    return Object.values(items).filter((i: any) => i.familyId === familyId);
  },

  // Memories
  async getMemories(familyId: string) {
    const memories = await firebaseRequest('/memories');
    if (!memories) return [];
    
    return Object.values(memories).filter((m: any) => m.familyId === familyId);
  },

  // Trips
  async getTrips(familyId: string) {
    const trips = await firebaseRequest('/trips');
    if (!trips) return [];
    
    return Object.values(trips).filter((t: any) => t.familyId === familyId);
  },

  // Assignments
  async getAssignments(familyId: string) {
    const assignments = await firebaseRequest('/assignments');
    if (!assignments) return [];
    
    return Object.values(assignments).filter((a: any) => a.familyId === familyId);
  },

  // DELETE OPERATIONS
  async deleteDocument(docId: string) {
    await firebaseRequest(`/documents/${docId}`, { method: 'DELETE' });
  },

  async deleteMemory(memoryId: string) {
    await firebaseRequest(`/memories/${memoryId}`, { method: 'DELETE' });
  },

  async deleteWishlistItem(itemId: string) {
    await firebaseRequest(`/wishlist/${itemId}`, { method: 'DELETE' });
  },

  async deleteTrip(tripId: string) {
    await firebaseRequest(`/trips/${tripId}`, { method: 'DELETE' });
  },

  async deleteAssignment(assignmentId: string) {
    await firebaseRequest(`/assignments/${assignmentId}`, { method: 'DELETE' });
  },

  async deleteMealPlan(mealId: string) {
    await firebaseRequest(`/mealPlans/${mealId}`, { method: 'DELETE' });
  },

  async deleteHealthRecord(recordId: string) {
    await firebaseRequest(`/healthRecords/${recordId}`, { method: 'DELETE' });
  },

  async deleteTask(taskId: string) {
    await firebaseRequest(`/tasks/${taskId}`, { method: 'DELETE' });
  },

  async deleteExpense(expenseId: string) {
    await firebaseRequest(`/expenses/${expenseId}`, { method: 'DELETE' });
    // Don't update wallet balance - calculate from transactions
  },

  async deleteIncome(incomeId: string) {
    await firebaseRequest(`/incomes/${incomeId}`, { method: 'DELETE' });
    // Don't update wallet balance - calculate from transactions
  },

  async deleteMember(memberId: string) {
    await firebaseRequest(`/members/${memberId}`, { method: 'DELETE' });
  },

  async updateAssignment(assignmentId: string, updates: any) {
    await firebaseRequest(`/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return updates;
  },

  async updateMember(memberId: string, updates: any) {
    const updatedMember = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await firebaseRequest(`/members/${memberId}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedMember),
    });
    return updatedMember;
  },

  // Appointments
  async getAppointments(familyId: string) {
    const appointments = await firebaseRequest('/appointments');
    if (!appointments) return [];
    
    return Object.values(appointments).filter((a: any) => a.familyId === familyId);
  },

  // Income
  async getIncomes(familyId: string) {
    const incomes = await firebaseRequest('/incomes');
    if (!incomes) return [];
    
    return Object.values(incomes).filter((i: any) => i.familyId === familyId);
  },

  async addIncome(incomeData: any) {
    const incomeId = `income-${Date.now()}`;
    const newIncome = {
      id: incomeId,
      ...incomeData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/incomes/${incomeId}`, {
      method: 'PUT',
      body: JSON.stringify(newIncome),
    });

    // Don't update wallet balance - calculate from transactions
    return newIncome;
  },

  async addWishlistItem(itemData: any) {
    const itemId = `wish-${Date.now()}`;
    const newItem = {
      id: itemId,
      ...itemData,
      memberId: itemData.memberId || itemData.assignedTo,
      purchased: false,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/wishlist/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(newItem),
    });

    return newItem;
  },

  async addMemory(memoryData: any) {
    const memoryId = `memory-${Date.now()}`;
    const newMemory = {
      id: memoryId,
      ...memoryData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/memories/${memoryId}`, {
      method: 'PUT',
      body: JSON.stringify(newMemory),
    });

    return newMemory;
  },

  async addTrip(tripData: any) {
    const tripId = `trip-${Date.now()}`;
    const newTrip = {
      id: tripId,
      ...tripData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(newTrip),
    });

    return newTrip;
  },

  async addAssignment(assignmentData: any) {
    const assignmentId = `assignment-${Date.now()}`;
    const newAssignment = {
      id: assignmentId,
      ...assignmentData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(newAssignment),
    });

    return newAssignment;
  },

  async addAppointment(appointmentData: any) {
    const appointmentId = `appt-${Date.now()}`;
    const newAppointment = {
      id: appointmentId,
      ...appointmentData,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(newAppointment),
    });

    return newAppointment;
  },

  async addReward(rewardData: any) {
    const rewardId = `reward-${Date.now()}`;
    const newReward = {
      id: rewardId,
      ...rewardData,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/rewards/${rewardId}`, {
      method: 'PUT',
      body: JSON.stringify(newReward),
    });

    return newReward;
  },

  // Create member account with login credentials
  async createMemberAccount(userData: any) {
    const userId = `user-${Date.now()}`;
    const now = new Date().toISOString();
    
    // Check if email already exists
    const users = await firebaseRequest('/users');
    if (users) {
      const existingUser = Object.values(users).find((u: any) => u.email === userData.email);
      if (existingUser) {
        throw new Error("Email already exists");
      }
    }
    
    const newUser = {
      id: userId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      familyId: userData.familyId,
      memberId: userData.memberId,
      role: userData.role,
      token: `firebase-token-${userId}-${Date.now()}`,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await firebaseRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(newUser),
    });

    return { userId, memberId: userData.memberId };
  },

  // Notification system
  async createNotification(notificationData: any) {
    const notificationId = `notification-${Date.now()}`;
    const newNotification = {
      id: notificationId,
      ...notificationData,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await firebaseRequest(`/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify(newNotification),
    });

    return newNotification;
  },

  async generateUpcomingNotifications(familyId: string) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get all family data
    const [tasks, events, members] = await Promise.all([
      this.getTasks(familyId),
      this.getCalendarEvents(familyId),
      this.getMembers(familyId)
    ]);

    // Check for upcoming tasks (due tomorrow)
    const upcomingTasks = tasks.filter((task: any) => {
      const dueDate = new Date(task.dueDate);
      return task.status === 'pending' && 
             dueDate >= now && 
             dueDate <= tomorrow;
    });

    // Check for upcoming events (next 7 days)
    const upcomingEvents = events.filter((event: any) => {
      const eventDate = new Date(event.startDate);
      return eventDate >= now && eventDate <= nextWeek;
    });

    // Generate task notifications
    for (const task of upcomingTasks) {
      const assignedMember = members.find((m: any) => m.id === task.assignedTo);
      if (assignedMember) {
        // Find user for this member
        const users = await firebaseRequest('/users');
        const user = users ? Object.values(users).find((u: any) => u.memberId === assignedMember.id) : null;
        
        if (user) {
          await this.createNotification({
            userId: (user as any).id,
            title: 'Task Due Tomorrow',
            message: `Your task "${task.title}" is due tomorrow`,
            type: 'warning',
            actionUrl: '/tasks'
          });
        }
      }
    }

    // Generate event notifications
    for (const event of upcomingEvents) {
      // Notify all family members about upcoming events
      const users = await firebaseRequest('/users');
      if (users) {
        const familyUsers = Object.values(users).filter((u: any) => u.familyId === familyId);
        
        for (const user of familyUsers) {
          const daysUntil = Math.ceil((new Date(event.startDate).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          await this.createNotification({
            userId: (user as any).id,
            title: `Upcoming Event: ${event.title}`,
            message: `${event.title} is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            type: 'info',
            actionUrl: '/calendar'
          });
        }
      }
    }

    return { taskNotifications: upcomingTasks.length, eventNotifications: upcomingEvents.length };
  },

};