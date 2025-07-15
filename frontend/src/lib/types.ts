import { Principal } from '@dfinity/principal';

// Common types
export type Timestamp = bigint;
export type Amount = bigint;
export type BondId = bigint;
export type ProposalId = bigint;
export type VotingPower = bigint;
export type TokenAmount = bigint;

// Vault Types
export type BondStatus = 
  | { 'Active': null }
  | { 'Withdrawn': null }
  | { 'Liquidated': null };

export interface Bond {
  id: BondId;
  founder: Principal;
  amount: Amount;
  collateralRatio: number;
  createdAt: Timestamp;
  status: BondStatus;
  lastUpdate: Timestamp;
}

export interface VaultStats {
  totalBonds: bigint;
  totalDeposited: Amount;
  totalWithdrawn: Amount;
  activeBonds: bigint;
  averageCollateralRatio: number;
}

export type DepositResult = 
  | { 'ok': BondId }
  | { 'err': string };

export type WithdrawResult = 
  | { 'ok': Amount }
  | { 'err': string };

export type BondResult = 
  | { 'ok': Bond }
  | { 'err': string };

// Governance Types
export type ProposalType = 
  | { 'ParameterChange': null }
  | { 'BondFloorUpdate': null }
  | { 'SystemUpgrade': null }
  | { 'TreasuryAction': null }
  | { 'Other': null };

export type ProposalStatus = 
  | { 'Active': null }
  | { 'Passed': null }
  | { 'Rejected': null }
  | { 'Executed': null }
  | { 'Cancelled': null };

export type Vote = 
  | { 'Yes': null }
  | { 'No': null }
  | { 'Abstain': null };

export interface Proposal {
  id: ProposalId;
  proposer: Principal;
  title: string;
  description: string;
  proposalType: ProposalType;
  createdAt: Timestamp;
  votingDeadline: Timestamp;
  status: ProposalStatus;
  yesVotes: VotingPower;
  noVotes: VotingPower;
  abstainVotes: VotingPower;
  totalVotingPower: VotingPower;
  executionPayload: string | null;
}

export interface VoteRecord {
  voter: Principal;
  vote: Vote;
  votingPower: VotingPower;
  timestamp: Timestamp;
}

export interface TokenHolder {
  principal: Principal;
  tokenBalance: TokenAmount;
  votingPower: VotingPower;
  delegatedTo: Principal | null;
}

export interface GovernanceStats {
  totalProposals: bigint;
  activeProposals: bigint;
  totalTokenSupply: TokenAmount;
  totalVotingPower: VotingPower;
  participationRate: number;
}

export type ProposalResult = 
  | { 'ok': ProposalId }
  | { 'err': string };

export type VoteResult = 
  | { 'ok': null }
  | { 'err': string };

// Splitter Types
export interface Recipient {
  principal: Principal;
  percentage: number;
  role: RecipientRole;
}

export type RecipientRole = 
  | { 'Developer': null }
  | { 'Founder': null }
  | { 'Investor': null }
  | { 'Other': null };

export interface Distribution {
  id: bigint;
  totalAmount: Amount;
  timestamp: Timestamp;
  recipients: Recipient[];
  status: DistributionStatus;
}

export type DistributionStatus = 
  | { 'Pending': null }
  | { 'Completed': null }
  | { 'Failed': null };

export interface SplitterStats {
  totalDistributions: bigint;
  totalRevenue: Amount;
  totalDeveloperShare: Amount;
  totalFounderShare: Amount;
  pendingClaims: Amount;
}

export type DistributionResult = 
  | { 'ok': bigint }
  | { 'err': string };

// Fallback Types
export interface Conversion {
  id: bigint;
  bondId: BondId;
  originalAmount: Amount;
  convertedAmount: Amount;
  conversionRate: number;
  status: ConversionStatus;
  triggeredAt: Timestamp;
  completedAt: Timestamp | null;
}

export type ConversionStatus = 
  | { 'Pending': null }
  | { 'Completed': null }
  | { 'Failed': null };

export type EmergencyActionType = 
  | { 'Pause': null }
  | { 'Resume': null }
  | { 'Emergency_Conversion': null }
  | { 'Rate_Update': null };

export interface EmergencyAction {
  id: bigint;
  actionType: EmergencyActionType;
  description: string;
  triggeredBy: Principal;
  timestamp: Timestamp;
  status: EmergencyActionStatus;
}

export type EmergencyActionStatus = 
  | { 'Active': null }
  | { 'Completed': null };

export type SystemStatus = 
  | { 'Normal': null }
  | { 'Warning': null }
  | { 'Emergency': null };

export interface FallbackStats {
  totalConversions: bigint;
  totalConverted: Amount;
  pendingConversions: bigint;
  emergencyThreshold: number;
  currentCollateralRatio: number;
  systemStatus: SystemStatus;
}

export type ConversionResult = 
  | { 'ok': bigint }
  | { 'err': string };

export type EmergencyActionResult = 
  | { 'ok': null }
  | { 'err': string };

// Generic Result type
export type Result<T, E> = 
  | { 'ok': T }
  | { 'err': E };

// Utility types for frontend display
export interface DisplayBond {
  id: number;
  amount: number;
  collateralRatio: number;
  status: 'Active' | 'Withdrawn' | 'Liquidated';
  createdAt: string;
}

export interface DisplayProposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: 'Active' | 'Passed' | 'Rejected' | 'Executed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endTime: string;
  createdAt: string;
}

export interface DisplayConversion {
  id: number;
  bondId: number;
  originalAmount: number;
  convertedAmount: number;
  conversionRate: number;
  status: 'Pending' | 'Completed' | 'Failed';
  triggeredAt: string;
  completedAt?: string;
}

export interface DisplayDistribution {
  id: number;
  totalAmount: number;
  timestamp: string;
  status: 'Pending' | 'Completed' | 'Failed';
}
