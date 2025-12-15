// Auth utilities and role-based access control

import { Role } from "@/types";
import { firebaseApi } from "./firebaseApi";

const AUTH_KEY = "familyhub_auth";

export interface AuthUser {
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

export const authUtils = {
  // Store auth data
  setAuth(user: AuthUser) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  },

  // Get current user
  getAuth(): AuthUser | null {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Clear auth
  clearAuth() {
    localStorage.removeItem(AUTH_KEY);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuth();
  },

  // Get current user's role
  getRole(): Role | null {
    const user = this.getAuth();
    return user ? user.role : null;
  },

  // Login with Firebase
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await firebaseApi.login(email, password);
    const user: AuthUser = {
      id: response.id,
      email: response.email,
      name: response.name,
      familyId: response.familyId,
      memberId: response.memberId,
      role: response.role,
      token: response.token,
      avatarUrl: response.avatarUrl,
      phone: response.phone,
    };
    this.setAuth(user);
    return user;
  },

  // Register with Firebase
  async register(userData: {
    email: string;
    password: string;
    name: string;
    familyName?: string;
    age?: number;
  }): Promise<AuthUser> {
    const response = await firebaseApi.register(userData);
    const user: AuthUser = {
      id: response.id,
      email: response.email,
      name: response.name,
      familyId: response.familyId,
      memberId: response.memberId,
      role: response.role,
      token: response.token,
    };
    this.setAuth(user);
    return user;
  },
};

// Role-based permissions
export const rolePermissions = {
  owner: {
    finance: true,
    health: true,
    docs: true,
    study: true,
    tasks: true,
    meals: true,
    trips: true,
    settings: true,
    manageMembers: true,
    approveExpenses: true,
    approveTasks: true,
  },
  adult: {
    finance: true,
    health: true,
    docs: true,
    study: true,
    tasks: true,
    meals: true,
    trips: true,
    settings: false,
    manageMembers: false,
    approveExpenses: true,
    approveTasks: true,
  },
  teen: {
    finance: false,
    health: true,
    docs: false,
    study: true,
    tasks: true,
    meals: true,
    trips: true,
    settings: false,
    manageMembers: false,
    approveExpenses: false,
    approveTasks: false,
  },
  child: {
    finance: false,
    health: false,
    docs: false,
    study: true,
    tasks: true,
    meals: true,
    trips: false,
    settings: false,
    manageMembers: false,
    approveExpenses: false,
    approveTasks: false,
  },
  guest: {
    finance: false,
    health: false,
    docs: false,
    study: false,
    tasks: false,
    meals: true,
    trips: true,
    settings: false,
    manageMembers: false,
    approveExpenses: false,
    approveTasks: false,
  },
};

export const hasPermission = (role: Role, permission: keyof typeof rolePermissions.owner): boolean => {
  return rolePermissions[role]?.[permission] || false;
};

export const canAccessModule = (role: Role, module: string): boolean => {
  const permissions: any = rolePermissions[role];
  return permissions?.[module] || false;
};
