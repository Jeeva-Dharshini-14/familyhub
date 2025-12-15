// API service layer - using Firebase for real-time database

import { firebaseApi } from './firebaseApi';

// Use Firebase API for real-time database updates
export const apiService = firebaseApi;

// For backward compatibility
export { firebaseApi as mockApi };