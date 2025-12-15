// Fast API for documents with minimal caching
import { firebaseApi } from './firebaseApi';

const FIREBASE_URL = "https://familyhub-96a91-default-rtdb.asia-southeast1.firebasedatabase.app";

// Direct Firebase request without caching for documents
const directRequest = async (path: string, options: RequestInit = {}) => {
  const url = `${FIREBASE_URL}${path}.json`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`Firebase error: ${response.status}`);
  }

  return response.json();
};

export const fastApi = {
  // Fast document loading without cache
  async getDocuments(familyId: string) {
    const documents = await directRequest('/documents');
    if (!documents) return [];
    
    return Object.values(documents).filter((d: any) => d.familyId === familyId);
  },

  // Fast health records loading
  async getHealthRecords(familyId: string) {
    const records = await directRequest('/healthRecords');
    if (!records) return [];
    
    return Object.values(records).filter((r: any) => r.familyId === familyId);
  },

  // Pass through other methods to firebaseApi
  ...firebaseApi
};