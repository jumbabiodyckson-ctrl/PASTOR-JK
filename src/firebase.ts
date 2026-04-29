import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  getDocFromServer, 
  collectionGroup, 
  limit, 
  deleteField,
  terminate,
  clearIndexedDbPersistence
} from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to handle potential network issues in sandboxed environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  // Using the databaseId from config
}, firebaseConfig.firestoreDatabaseId as string);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/**
 * Handle Firestore errors in a user-friendly way
 */
export const handleFirestoreError = (error: any, operationType: string, path: string | null = null) => {
  const authUser = auth.currentUser;
  const errorInfo = {
    error: error.message || 'Unknown error',
    operationType,
    path,
    authInfo: {
      userId: authUser?.uid || 'unauthenticated',
      email: authUser?.email || 'N/A',
      emailVerified: authUser?.emailVerified || false,
      isAnonymous: authUser?.isAnonymous || false,
      providerInfo: authUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName,
        email: p.email
      })) || []
    }
  };
  
  if (error.code === 'permission-denied') {
    console.error("FIRESTORE_PERMISSION_DENIED", errorInfo);
    throw new Error(JSON.stringify(errorInfo));
  } else if (error.code === 'unavailable') {
    console.error("FIRESTORE_UNAVAILABLE - Backend connection failure", errorInfo);
  }
  
  return error;
};

// Validation function for Firestore connection
async function testConnection() {
  try {
    // Attempt to clear persistence to resolve potential local state corruption
    try {
      await clearIndexedDbPersistence(db);
    } catch (e) {
      // Ignore errors during persistence clearing
    }
    
    // Test the specific database connection
    await getDocFromServer(doc(db, 'test_connection', 'ping'));
    console.log("FIRESTORE_STATUS: CONNECTED");
  } catch (error) {
    if (error instanceof Error && (error.message.includes('client is offline') || error.message.includes('Backend didn\'t respond'))) {
      console.error("FATAL: Could not reach Cloud Firestore backend. Please check your Firebase configuration and network parameters.");
    } else if ((error as any).code === 'permission-denied') {
      // This is actually a semi-success: it reached the server but was denied
      console.log("FIRESTORE_STATUS: REACHABLE (Auth Required)");
    }
  }
}
testConnection();

export { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  collectionGroup,
  limit,
  deleteField
};
export type { FirebaseUser };
