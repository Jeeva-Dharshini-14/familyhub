// Optimized API with local caching and batch requests
import { firebaseApi } from './firebaseApi';

class OptimizedAPI {
  private cache = new Map();
  private readonly CACHE_DURATION = 5000; // 5 seconds

  private getCacheKey(method: string, ...args: any[]) {
    return `${method}_${JSON.stringify(args)}`;
  }

  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Batch load dashboard data
  async getDashboardData(familyId: string) {
    const key = this.getCacheKey('dashboard', familyId);
    return this.getCached(key, async () => {
      const [wallets, tasks, healthRecords, expenses] = await Promise.all([
        firebaseApi.getWallets(familyId),
        firebaseApi.getTasks(familyId),
        firebaseApi.getHealthRecords(familyId),
        firebaseApi.getExpenses(familyId),
      ]);
      return { wallets, tasks, healthRecords, expenses };
    });
  }

  // Cached member loading
  async getMembers(familyId: string) {
    const key = this.getCacheKey('members', familyId);
    return this.getCached(key, () => firebaseApi.getMembers(familyId));
  }

  // Clear cache when data is modified
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Proxy other methods to firebaseApi
  async addExpense(data: any) {
    const result = await firebaseApi.addExpense(data);
    this.clearCache('dashboard');
    this.clearCache('expenses');
    return result;
  }

  async addTask(data: any) {
    const result = await firebaseApi.addTask(data);
    this.clearCache('dashboard');
    this.clearCache('tasks');
    return result;
  }

  async addHealthRecord(data: any) {
    const result = await firebaseApi.addHealthRecord(data);
    this.clearCache('dashboard');
    this.clearCache('health');
    return result;
  }

  // Cached getter methods
  async getWallets(familyId: string) {
    const key = this.getCacheKey('wallets', familyId);
    return this.getCached(key, () => firebaseApi.getWallets(familyId));
  }

  async getTasks(familyId: string) {
    const key = this.getCacheKey('tasks', familyId);
    return this.getCached(key, () => firebaseApi.getTasks(familyId));
  }

  async getHealthRecords(familyId: string) {
    // Direct call without caching for faster loading
    return firebaseApi.getHealthRecords(familyId);
  }

  async getExpenses(familyId: string) {
    const key = this.getCacheKey('expenses', familyId);
    return this.getCached(key, () => firebaseApi.getExpenses(familyId));
  }

  async getCategories(familyId: string) {
    const key = this.getCacheKey('categories', familyId);
    return this.getCached(key, () => firebaseApi.getCategories(familyId));
  }

  async getDocuments(familyId: string) {
    // Direct call without caching for faster loading
    return firebaseApi.getDocuments(familyId);
  }

  async getWishlistItems(familyId: string) {
    const key = this.getCacheKey('wishlist', familyId);
    return this.getCached(key, () => firebaseApi.getWishlistItems(familyId));
  }

  async getMemories(familyId: string) {
    const key = this.getCacheKey('memories', familyId);
    return this.getCached(key, () => firebaseApi.getMemories(familyId));
  }

  async getTrips(familyId: string) {
    const key = this.getCacheKey('trips', familyId);
    return this.getCached(key, () => firebaseApi.getTrips(familyId));
  }

  async getAssignments(familyId: string) {
    const key = this.getCacheKey('assignments', familyId);
    return this.getCached(key, () => firebaseApi.getAssignments(familyId));
  }

  async getMealPlans(familyId: string) {
    const key = this.getCacheKey('meals', familyId);
    return this.getCached(key, () => firebaseApi.getMealPlans(familyId));
  }

  async getPantryItems(familyId: string) {
    const key = this.getCacheKey('pantry', familyId);
    return this.getCached(key, () => firebaseApi.getPantryItems(familyId));
  }

  async getRewards(familyId: string) {
    const key = this.getCacheKey('rewards', familyId);
    return this.getCached(key, () => firebaseApi.getRewards(familyId));
  }

  async getCalendarEvents(familyId: string) {
    const key = this.getCacheKey('calendar', familyId);
    return this.getCached(key, () => firebaseApi.getCalendarEvents(familyId));
  }

  async getAppointments(familyId: string) {
    const key = this.getCacheKey('appointments', familyId);
    return this.getCached(key, () => firebaseApi.getAppointments(familyId));
  }

  async getIncomes(familyId: string) {
    const key = this.getCacheKey('incomes', familyId);
    return this.getCached(key, () => firebaseApi.getIncomes(familyId));
  }

  getNotifications = (userId: string) => firebaseApi.getNotifications(userId);
  getMemberPoints = (memberId: string) => firebaseApi.getMemberPoints(memberId);

  // Delete methods with cache clearing
  async deleteDocument(id: string) {
    await firebaseApi.deleteDocument(id);
    this.clearCache('documents');
  }

  async deleteMemory(id: string) {
    await firebaseApi.deleteMemory(id);
    this.clearCache('memories');
  }

  async deleteWishlistItem(id: string) {
    await firebaseApi.deleteWishlistItem(id);
    this.clearCache('wishlist');
  }

  async deleteTrip(id: string) {
    await firebaseApi.deleteTrip(id);
    this.clearCache('trips');
  }

  async deleteAssignment(id: string) {
    await firebaseApi.deleteAssignment(id);
    this.clearCache('assignments');
  }

  async deleteMealPlan(id: string) {
    await firebaseApi.deleteMealPlan(id);
    this.clearCache('meals');
  }

  async deleteHealthRecord(id: string) {
    await firebaseApi.deleteHealthRecord(id);
    this.clearCache('health');
    this.clearCache('dashboard');
  }

  async deleteTask(id: string) {
    await firebaseApi.deleteTask(id);
    this.clearCache('tasks');
    this.clearCache('dashboard');
  }

  async deleteExpense(id: string) {
    await firebaseApi.deleteExpense(id);
    this.clearCache('expenses');
    this.clearCache('dashboard');
  }

  async deleteMember(id: string) {
    await firebaseApi.deleteMember(id);
    this.clearCache('members');
  }

  // Add methods
  addWallet = (data: any) => firebaseApi.addWallet(data);
  addCategory = (data: any) => firebaseApi.addCategory(data);
  updateTask = (id: string, data: any) => firebaseApi.updateTask(id, data);
  uploadDocument = (data: any) => firebaseApi.uploadDocument(data);
  addCalendarEvent = (data: any) => firebaseApi.addCalendarEvent(data);
  addMealPlan = (data: any) => firebaseApi.addMealPlan(data);
  addPantryItem = (data: any) => firebaseApi.addPantryItem(data);
  addIncome = (data: any) => firebaseApi.addIncome(data);
  addWishlistItem = (data: any) => firebaseApi.addWishlistItem(data);
  addMemory = (data: any) => firebaseApi.addMemory(data);
  addTrip = (data: any) => firebaseApi.addTrip(data);
  addAssignment = (data: any) => firebaseApi.addAssignment(data);
  addAppointment = (data: any) => firebaseApi.addAppointment(data);
  addReward = (data: any) => firebaseApi.addReward(data);
  addMember = (data: any) => firebaseApi.addMember(data);
  updateUser = (id: string, data: any) => firebaseApi.updateUser(id, data);
  createFamily = (data: any, userId?: string) => firebaseApi.createFamily(data, userId);
  updateFamily = (id: string, data: any) => firebaseApi.updateFamily(id, data);
  register = (data: any) => firebaseApi.register(data);
  login = (email: string, password: string) => firebaseApi.login(email, password);
}

export const optimizedApi = new OptimizedAPI();