// Core type definitions for FamilyHub

export type Role = "owner" | "adult" | "teen" | "child" | "guest";

export type Gender = "male" | "female" | "other" | "prefer-not-to-say";

export type Relationship =
  | "father"
  | "mother"
  | "son"
  | "daughter"
  | "grandfather"
  | "grandmother"
  | "sibling"
  | "other";

export interface Member {
  id: string;
  familyId: string;
  name: string;
  age: number;
  dateOfBirth: string;
  gender: Gender;
  relationship: Relationship;
  role: Role;
  profileImage?: string;
  email?: string;
  phone?: string;
  permissions: {
    finance: boolean;
    health: boolean;
    docs: boolean;
    study: boolean;
    tasks: boolean;
    meals: boolean;
    trips: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  name: string;
  avatar?: string;
  ownerId: string;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  familyId: string;
  memberId: string;
  role: Role;
  token: string;
  avatarUrl?: string;
  phone?: string;
}

export interface Wallet {
  id: string;
  familyId: string;
  name: string;
  balance: number;
  currency: string;
  isShared: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  familyId: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface Expense {
  id: string;
  familyId: string;
  walletId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  createdBy: string;
  isRecurring: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  tags: string[];
  createdAt: string;
}

export interface Income {
  id: string;
  familyId: string;
  walletId: string;
  amount: number;
  source: string;
  date: string;
  createdBy: string;
  isRecurring: boolean;
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: string;
}

export interface Task {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  points: number;
  status: "pending" | "completed" | "approved";
  isRecurring: boolean;
  recurringSchedule?: string;
  completedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface Reward {
  id: string;
  familyId: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: string;
  createdAt: string;
}

export interface RedemptionHistory {
  id: string;
  familyId: string;
  memberId: string;
  rewardId: string;
  pointsSpent: number;
  redeemedAt: string;
}

export interface HealthRecord {
  id: string;
  familyId: string;
  memberId: string;
  type: "prescription" | "report" | "vaccination" | "appointment" | "vitals";
  title: string;
  description?: string;
  fileUrl?: string;
  data?: any;
  date: string;
  tags: string[];
  createdAt: string;
}

export interface Vitals {
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
}

export interface Appointment {
  id: string;
  familyId: string;
  memberId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

export interface Recipe {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  ingredients: string[];
  instructions?: string;
  allergens: string[];
  imageUrl?: string;
  prepTime?: number;
  servings?: number;
  createdAt: string;
}

export interface MealPlan {
  id: string;
  familyId: string;
  date: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snacks?: string[];
  createdAt: string;
}

export interface PantryItem {
  id: string;
  familyId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate?: string;
  lowStockThreshold?: number;
  createdAt: string;
}

export interface Document {
  id: string;
  familyId: string;
  name: string;
  type: string;
  fileUrl: string;
  tags: string[];
  uploadedBy: string;
  isEncrypted: boolean;
  shareLink?: string;
  shareLinkExpiry?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: "task" | "bill" | "appointment" | "exam" | "event" | "trip";
  relatedId?: string;
  color: string;
  createdBy: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  familyId: string;
  memberId: string;
  name: string;
  url?: string;
  imageUrl?: string;
  price?: number;
  currency: string;
  priority: "low" | "medium" | "high";
  purchased: boolean;
  purchasedAt?: string;
  createdAt: string;
}

export interface Trip {
  id: string;
  familyId: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  itinerary: TripDay[];
  packingList: PackingItem[];
  photos: string[];
  createdBy: string;
  createdAt: string;
}

export interface TripDay {
  day: number;
  date: string;
  activities: string[];
}

export interface PackingItem {
  id: string;
  item: string;
  assignedTo: string;
  packed: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}
