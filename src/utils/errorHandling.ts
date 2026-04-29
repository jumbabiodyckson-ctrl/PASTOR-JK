import { auth } from '../firebase';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null): never {
  const firebaseUser = auth.currentUser;
  
  const errorInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: firebaseUser?.uid || 'anonymous',
      email: firebaseUser?.email || 'anonymous',
      emailVerified: firebaseUser?.emailVerified || false,
      isAnonymous: firebaseUser?.isAnonymous || true,
      providerInfo: firebaseUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };

  const errorString = JSON.stringify(errorInfo, null, 2);
  console.error("Firestore Operation Failed:", errorString);
  throw new Error(errorString);
}

export function getFriendlyErrorMessage(error: any): string {
  let message = "An unexpected error occurred. Please try again.";
  
  const errorStr = error instanceof Error ? error.message : String(error);
  
  try {
    // Check if it's our JSON error format
    if (errorStr.includes('{') && errorStr.includes('operationType')) {
      const parsed = JSON.parse(errorStr);
      if (parsed.error.includes('permission-denied') || parsed.error.includes('Missing or insufficient permissions')) {
        return "ACCESS_DENIED: You do not have permission to perform this strategic operation. Please ensure your account is verified and you have the correct administrative role.";
      }
      return `STRATEGIC_FAIL: ${parsed.operationType.toUpperCase()} operation failed. ${parsed.error}`;
    }
  } catch (e) {
    // Not a JSON error or parsing failed
  }

  if (errorStr.includes('network') || errorStr.includes('offline')) {
    return "CONNECTION_INTERRUPTED: Please check your network stability and try again.";
  }
  
  if (errorStr.includes('quota') || errorStr.includes('limit')) {
    return "SYSTEM_CAPACITY_REACHED: Daily operational quotas exceeded. Service will resume shortly.";
  }

  if (errorStr.includes('not found')) {
    return "RESOURCE_NOT_FOUND: The requested strategic asset could not be located in the cloud buffer.";
  }

  return `PROTOCOL_ERROR: ${errorStr}`;
}
