import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6879ceaa42684aad8e027832", 
  requiresAuth: true // Ensure authentication is required for all operations
});
