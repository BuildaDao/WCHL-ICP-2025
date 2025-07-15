// Export all services
export { default as vaultService } from './vault.service';
export { default as governanceService } from './governance.service';

// Re-export types for convenience
export type {
  Bond,
  VaultStats,
  DisplayBond,
  Proposal,
  GovernanceStats,
  DisplayProposal,
} from '../types';

// Re-export agent utilities
export {
  initializeAgent,
  initializeAuthClient,
  login,
  logout,
  isAuthenticated,
  getCurrentPrincipal,
  formatPrincipal,
  isDevelopment,
} from '../agent';
