import { HttpAgent, Actor, ActorSubclass } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';

// Environment configuration
const HOST = process.env.NODE_ENV === 'production' 
  ? 'https://ic0.app' 
  : 'http://localhost:4943';

const IDENTITY_PROVIDER = process.env.NODE_ENV === 'production'
  ? 'https://identity.ic0.app'
  : `http://localhost:4943/?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}`;

// Canister IDs - these will be populated from dfx.json or environment variables
export const CANISTER_IDS = {
  vault: process.env.NEXT_PUBLIC_VAULT_CANISTER_ID || 'rdmx6-jaaaa-aaaaa-aaadq-cai',
  splitter: process.env.NEXT_PUBLIC_SPLITTER_CANISTER_ID || 'rrkah-fqaaa-aaaaa-aaaaq-cai',
  governance: process.env.NEXT_PUBLIC_GOVERNANCE_CANISTER_ID || 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  fallback: process.env.NEXT_PUBLIC_FALLBACK_CANISTER_ID || 'renrk-eyaaa-aaaaa-aaada-cai',
};

// Global agent instance
let agent: HttpAgent | null = null;
let authClient: AuthClient | null = null;

/**
 * Initialize the HTTP agent for canister communication
 */
export async function initializeAgent(): Promise<HttpAgent> {
  if (agent) {
    return agent;
  }

  agent = new HttpAgent({
    host: HOST,
  });

  // Fetch root key for local development
  if (process.env.NODE_ENV !== 'production') {
    try {
      await agent.fetchRootKey();
    } catch (error) {
      console.warn('Unable to fetch root key. Check if the local replica is running.');
      console.error(error);
    }
  }

  return agent;
}

/**
 * Initialize the authentication client
 */
export async function initializeAuthClient(): Promise<AuthClient> {
  if (authClient) {
    return authClient;
  }

  authClient = await AuthClient.create({
    idleOptions: {
      idleTimeout: 1000 * 60 * 30, // 30 minutes
      disableDefaultIdleCallback: true,
    },
  });

  return authClient;
}

/**
 * Login with Internet Identity
 */
export async function login(): Promise<boolean> {
  const client = await initializeAuthClient();
  
  return new Promise((resolve) => {
    client.login({
      identityProvider: IDENTITY_PROVIDER,
      onSuccess: () => {
        updateAgentIdentity();
        resolve(true);
      },
      onError: (error) => {
        console.error('Login failed:', error);
        resolve(false);
      },
    });
  });
}

/**
 * Logout and clear identity
 */
export async function logout(): Promise<void> {
  const client = await initializeAuthClient();
  await client.logout();
  
  // Reset agent with anonymous identity
  agent = null;
  await initializeAgent();
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const client = await initializeAuthClient();
  return await client.isAuthenticated();
}

/**
 * Get current user's principal
 */
export async function getCurrentPrincipal(): Promise<Principal | null> {
  const client = await initializeAuthClient();
  const identity = client.getIdentity();
  return identity.getPrincipal();
}

/**
 * Update agent with current identity
 */
async function updateAgentIdentity(): Promise<void> {
  const client = await initializeAuthClient();
  const identity = client.getIdentity();
  
  if (agent) {
    agent.replaceIdentity(identity);
  }
}

/**
 * Create an actor for a specific canister
 */
export async function createActor<T>(
  canisterId: string,
  idlFactory: any
): Promise<ActorSubclass<T>> {
  const currentAgent = await initializeAgent();
  
  // Update identity if authenticated
  if (await isAuthenticated()) {
    await updateAgentIdentity();
  }

  return Actor.createActor<T>(idlFactory, {
    agent: currentAgent,
    canisterId,
  });
}

/**
 * Utility function to handle canister calls with error handling
 */
export async function callCanister<T>(
  canisterCall: () => Promise<T>,
  errorMessage: string = 'Canister call failed'
): Promise<T | null> {
  try {
    return await canisterCall();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        // Redirect to login or show auth modal
        console.warn('User needs to authenticate');
      } else if (error.message.includes('Canister not found')) {
        console.error('Canister deployment issue');
      }
    }
    
    return null;
  }
}

/**
 * Format principal for display (truncated)
 */
export function formatPrincipal(principal: Principal | string): string {
  const principalStr = typeof principal === 'string' ? principal : principal.toString();
  if (principalStr.length <= 12) return principalStr;
  return `${principalStr.slice(0, 6)}...${principalStr.slice(-6)}`;
}

/**
 * Convert nanoseconds to milliseconds for JavaScript Date
 */
export function nanosToMillis(nanos: bigint): number {
  return Number(nanos / BigInt(1_000_000));
}

/**
 * Convert milliseconds to nanoseconds for Motoko
 */
export function millisToNanos(millis: number): bigint {
  return BigInt(millis) * BigInt(1_000_000);
}

/**
 * Format ICP amount for display
 */
export function formatICP(amount: bigint): string {
  const icpAmount = Number(amount) / 100_000_000; // Convert e8s to ICP
  return icpAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

/**
 * Parse ICP amount from string to e8s (smallest unit)
 */
export function parseICP(amount: string): bigint {
  const icpAmount = parseFloat(amount);
  return BigInt(Math.round(icpAmount * 100_000_000));
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Get canister URL for debugging
 */
export function getCanisterUrl(canisterId: string): string {
  if (isDevelopment()) {
    return `http://localhost:4943/?canisterId=${canisterId}`;
  }
  return `https://${canisterId}.ic0.app`;
}
