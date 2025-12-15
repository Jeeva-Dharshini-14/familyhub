// Real API service for backend integration

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Utility to get auth token
const getAuthToken = () => {
  const auth = localStorage.getItem('familyhub_auth');
  return auth ? JSON.parse(auth).token : null;
};

// Utility to make requests (with optional authentication)
const apiRequest = async (endpoint: string, options: RequestInit = {}, requireAuth = true) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(requireAuth && token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection');
    }
    throw error;
  }
};

export const api = {
  // Auth
  async login(email: string, password: string) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false); // No auth required for login
  },

  async register(userData: any) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false); // No auth required for registration
  },

  // Family
  async createFamily(familyData: any) {
    return apiRequest('/families', {
      method: 'POST',
      body: JSON.stringify(familyData),
    });
  },

  async getFamily(familyId: string) {
    return apiRequest(`/families/${familyId}`);
  },

  async updateFamily(familyId: string, updates: any) {
    return apiRequest(`/families/${familyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Members
  async addMember(memberData: any) {
    return apiRequest('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  async getMembers(familyId: string) {
    return apiRequest(`/members/family/${familyId}`);
  },

  async getMember(memberId: string) {
    return apiRequest(`/members/${memberId}`);
  },

  async updateMember(memberId: string, updates: any) {
    return apiRequest(`/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteMember(memberId: string) {
    return apiRequest(`/members/${memberId}`, {
      method: 'DELETE',
    });
  },

  // Finance
  async addExpense(expenseData: any) {
    return apiRequest('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },

  async getExpenses(familyId: string) {
    return apiRequest(`/finance/expenses/${familyId}`);
  },

  async deleteExpense(expenseId: string) {
    return apiRequest(`/finance/expenses/${expenseId}`, {
      method: 'DELETE',
    });
  },

  async addIncome(incomeData: any) {
    return apiRequest('/finance/incomes', {
      method: 'POST',
      body: JSON.stringify(incomeData),
    });
  },

  async getIncomes(familyId: string) {
    return apiRequest(`/finance/incomes/${familyId}`);
  },

  async deleteIncome(incomeId: string) {
    return apiRequest(`/finance/incomes/${incomeId}`, {
      method: 'DELETE',
    });
  },

  async getWallets(familyId: string) {
    return apiRequest(`/finance/wallets/${familyId}`);
  },

  async addWallet(walletData: any) {
    return apiRequest('/finance/wallets', {
      method: 'POST',
      body: JSON.stringify(walletData),
    });
  },

  async updateWallet(walletId: string, updates: any) {
    return apiRequest(`/finance/wallets/${walletId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteWallet(walletId: string) {
    return apiRequest(`/finance/wallets/${walletId}`, {
      method: 'DELETE',
    });
  },

  async getCategories(familyId: string) {
    return apiRequest(`/finance/categories/${familyId}`);
  },

  async addCategory(categoryData: any) {
    return apiRequest('/finance/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },

  // Tasks
  async addTask(taskData: any) {
    return apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async getTasks(familyId: string) {
    return apiRequest(`/tasks/${familyId}`);
  },

  async updateTask(taskId: string, updates: any) {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(taskId: string) {
    return apiRequest(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  async getMemberPoints(memberId: string) {
    return apiRequest(`/members/points/${memberId}`);
  },

  async getRewards(familyId: string) {
    return apiRequest(`/tasks/rewards/${familyId}`);
  },

  async addReward(rewardData: any) {
    return apiRequest('/tasks/rewards', {
      method: 'POST',
      body: JSON.stringify(rewardData),
    });
  },

  async redeemReward(rewardId: string, memberId: string) {
    return apiRequest('/tasks/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId, memberId }),
    });
  },

  async getRedemptions(familyId: string) {
    return apiRequest(`/tasks/redemptions/${familyId}`);
  },

  // Health
  async addHealthRecord(recordData: any) {
    return apiRequest('/health/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    });
  },

  async getHealthRecords(familyId: string, memberId?: string) {
    const url = memberId 
      ? `/health/records/${familyId}?memberId=${memberId}`
      : `/health/records/${familyId}`;
    return apiRequest(url);
  },

  async addAppointment(appointmentData: any) {
    return apiRequest('/health/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  async getAppointments(familyId: string, memberId?: string) {
    const url = memberId 
      ? `/health/appointments/${familyId}?memberId=${memberId}`
      : `/health/appointments/${familyId}`;
    return apiRequest(url);
  },

  async updateAppointment(appointmentId: string, updates: any) {
    return apiRequest(`/health/appointments/${appointmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Documents
  async uploadDocument(documentData: any) {
    return apiRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  },

  async getDocuments(familyId: string) {
    return apiRequest(`/documents/${familyId}`);
  },

  async deleteDocument(documentId: string) {
    return apiRequest(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  // Calendar
  async addCalendarEvent(eventData: any) {
    return apiRequest('/calendar/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  async getCalendarEvents(familyId: string) {
    return apiRequest(`/calendar/events/${familyId}`);
  },

  async updateCalendarEvent(eventId: string, updates: any) {
    return apiRequest(`/calendar/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteCalendarEvent(eventId: string) {
    return apiRequest(`/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
  },

  // Kitchen
  async addMealPlan(mealData: any) {
    return apiRequest('/kitchen/meals', {
      method: 'POST',
      body: JSON.stringify(mealData),
    });
  },

  async getMealPlans(familyId: string) {
    return apiRequest(`/kitchen/meals/${familyId}`);
  },

  async deleteMealPlan(mealId: string) {
    return apiRequest(`/kitchen/meals/${mealId}`, {
      method: 'DELETE',
    });
  },

  async addPantryItem(itemData: any) {
    return apiRequest('/kitchen/pantry', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async getPantryItems(familyId: string) {
    return apiRequest(`/kitchen/pantry/${familyId}`);
  },

  async deletePantryItem(itemId: string) {
    return apiRequest(`/kitchen/pantry/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Memories
  async addMemory(memoryData: any) {
    return apiRequest('/memories', {
      method: 'POST',
      body: JSON.stringify(memoryData),
    });
  },

  async getMemories(familyId: string) {
    return apiRequest(`/memories/${familyId}`);
  },

  async deleteMemory(memoryId: string) {
    return apiRequest(`/memories/${memoryId}`, {
      method: 'DELETE',
    });
  },

  // Trips
  async addTrip(tripData: any) {
    return apiRequest('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  async getTrips(familyId: string) {
    return apiRequest(`/trips/${familyId}`);
  },

  async deleteTrip(tripId: string) {
    return apiRequest(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  },

  // Study
  async addAssignment(assignmentData: any) {
    return apiRequest('/study/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  async getAssignments(familyId: string) {
    return apiRequest(`/study/assignments/${familyId}`);
  },

  async updateAssignment(assignmentId: string, updates: any) {
    return apiRequest(`/study/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteAssignment(assignmentId: string) {
    return apiRequest(`/study/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  },

  // Wishlist
  async addWishlistItem(itemData: any) {
    return apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  async getWishlistItems(familyId: string, memberId?: string) {
    const url = memberId 
      ? `/wishlist/${familyId}?memberId=${memberId}`
      : `/wishlist/${familyId}`;
    return apiRequest(url);
  },

  async updateWishlistItem(itemId: string, updates: any) {
    return apiRequest(`/wishlist/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteWishlistItem(itemId: string) {
    return apiRequest(`/wishlist/${itemId}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async getNotifications(userId: string) {
    return apiRequest(`/notifications/${userId}`);
  },

  async markNotificationRead(notificationId: string) {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  async clearAllNotifications(userId: string) {
    return apiRequest(`/notifications/${userId}`, {
      method: 'DELETE',
    });
  },

  // User Profile
  async updateUser(userId: string, updates: any) {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getUser(userId: string) {
    return apiRequest(`/users/${userId}`);
  },

  // Initialize demo data (for development)
  async initDemoData() {
    // This method is only used in mock mode
    return Promise.resolve({});
  },
};