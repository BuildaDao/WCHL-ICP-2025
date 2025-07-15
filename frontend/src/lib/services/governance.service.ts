import { ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { createActor, callCanister, CANISTER_IDS, nanosToMillis, formatPrincipal } from '../agent';
import GovernanceIDL from '../idl/governance.idl';
import { 
  Proposal, 
  GovernanceStats, 
  ProposalResult, 
  VoteResult,
  DisplayProposal,
  ProposalType,
  ProposalStatus,
  Vote 
} from '../types';

// Governance Actor Interface
interface GovernanceActor {
  createProposal: (title: string, description: string, proposalType: ProposalType, executionPayload: string | null) => Promise<ProposalResult>;
  vote: (proposalId: bigint, vote: Vote) => Promise<VoteResult>;
  getProposal: (proposalId: bigint) => Promise<Proposal | null>;
  getAllProposals: () => Promise<Proposal[]>;
  getGovernanceStats: () => Promise<GovernanceStats>;
  getVotingPower: (user: Principal) => Promise<bigint>;
}

class GovernanceService {
  private actor: ActorSubclass<GovernanceActor> | null = null;

  /**
   * Initialize the governance actor
   */
  private async getActor(): Promise<ActorSubclass<GovernanceActor>> {
    if (!this.actor) {
      this.actor = await createActor<GovernanceActor>(CANISTER_IDS.governance, GovernanceIDL);
    }
    return this.actor;
  }

  /**
   * Reset the actor (useful when switching identities)
   */
  public resetActor(): void {
    this.actor = null;
  }

  /**
   * Create a new proposal
   */
  public async createProposal(
    title: string, 
    description: string, 
    proposalType: 'ParameterChange' | 'BondFloorUpdate' | 'SystemUpgrade' | 'TreasuryAction' | 'Other' = 'Other'
  ): Promise<number | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const typeVariant = { [proposalType]: null } as ProposalType;
      const result = await actor.createProposal(title, description, typeVariant, null);
      
      if ('ok' in result) {
        return Number(result.ok);
      } else {
        throw new Error(result.err);
      }
    }, 'Failed to create proposal');
  }

  /**
   * Vote on a proposal
   */
  public async vote(proposalId: number, voteChoice: 'Yes' | 'No' | 'Abstain'): Promise<boolean> {
    const actor = await this.getActor();
    
    const result = await callCanister(async () => {
      const voteVariant = { [voteChoice]: null } as Vote;
      const result = await actor.vote(BigInt(proposalId), voteVariant);
      
      if ('ok' in result) {
        return true;
      } else {
        throw new Error(result.err);
      }
    }, 'Failed to vote on proposal');

    return result || false;
  }

  /**
   * Get proposal details by ID
   */
  public async getProposal(proposalId: number): Promise<DisplayProposal | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const proposal = await actor.getProposal(BigInt(proposalId));
      
      if (proposal) {
        return this.convertProposalToDisplay(proposal);
      } else {
        throw new Error('Proposal not found');
      }
    }, 'Failed to get proposal');
  }

  /**
   * Get all proposals
   */
  public async getAllProposals(): Promise<DisplayProposal[]> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const proposals = await actor.getAllProposals();
      return proposals.map(proposal => this.convertProposalToDisplay(proposal));
    }, 'Failed to get proposals') || [];
  }

  /**
   * Get governance statistics
   */
  public async getGovernanceStats(): Promise<{
    totalProposals: number;
    activeProposals: number;
    totalVoters: number;
    yourVotingPower: number;
    participationRate: number;
  } | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const stats = await actor.getGovernanceStats();
      
      // Get current user's voting power
      const identity = await import('../agent').then(m => m.getCurrentPrincipal());
      let userVotingPower = 0;
      
      if (identity) {
        const votingPower = await actor.getVotingPower(identity);
        userVotingPower = Number(votingPower);
      }
      
      return {
        totalProposals: Number(stats.totalProposals),
        activeProposals: Number(stats.activeProposals),
        totalVoters: Number(stats.totalVotingPower), // Approximation
        yourVotingPower: userVotingPower,
        participationRate: stats.participationRate,
      };
    }, 'Failed to get governance stats');
  }

  /**
   * Get user's voting power
   */
  public async getMyVotingPower(): Promise<number | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const identity = await import('../agent').then(m => m.getCurrentPrincipal());
      if (!identity) {
        throw new Error('User not authenticated');
      }

      const votingPower = await actor.getVotingPower(identity);
      return Number(votingPower);
    }, 'Failed to get voting power');
  }

  /**
   * Check if user can create proposals
   */
  public async canCreateProposal(): Promise<{ canCreate: boolean; reason?: string }> {
    const votingPower = await this.getMyVotingPower();
    
    if (!votingPower) {
      return { canCreate: false, reason: 'Unable to verify voting power' };
    }

    if (votingPower < 1000) {
      return { canCreate: false, reason: 'Minimum 1000 voting power required to create proposals' };
    }

    return { canCreate: true };
  }

  /**
   * Convert canister Proposal to DisplayProposal
   */
  private convertProposalToDisplay(proposal: Proposal): DisplayProposal {
    const getStatusString = (status: ProposalStatus): 'Active' | 'Passed' | 'Rejected' | 'Executed' => {
      if ('Active' in status) return 'Active';
      if ('Passed' in status) return 'Passed';
      if ('Rejected' in status) return 'Rejected';
      if ('Executed' in status) return 'Executed';
      return 'Active'; // fallback
    };

    const totalVotes = Number(proposal.yesVotes + proposal.noVotes + proposal.abstainVotes);

    return {
      id: Number(proposal.id),
      title: proposal.title,
      description: proposal.description,
      proposer: formatPrincipal(proposal.proposer),
      status: getStatusString(proposal.status),
      votesFor: Number(proposal.yesVotes),
      votesAgainst: Number(proposal.noVotes),
      totalVotes: totalVotes,
      endTime: new Date(nanosToMillis(proposal.votingDeadline)).toISOString().split('T')[0],
      createdAt: new Date(nanosToMillis(proposal.createdAt)).toISOString().split('T')[0],
    };
  }

  /**
   * Get active proposals only
   */
  public async getActiveProposals(): Promise<DisplayProposal[]> {
    const allProposals = await this.getAllProposals();
    return allProposals.filter(proposal => proposal.status === 'Active');
  }

  /**
   * Get proposals by status
   */
  public async getProposalsByStatus(status: 'Active' | 'Passed' | 'Rejected' | 'Executed'): Promise<DisplayProposal[]> {
    const allProposals = await this.getAllProposals();
    return allProposals.filter(proposal => proposal.status === status);
  }

  /**
   * Check if user has voted on a proposal
   */
  public async hasUserVoted(proposalId: number): Promise<boolean> {
    // In a real implementation, you'd check the vote records
    // For now, return false as a placeholder
    return false;
  }
}

// Export singleton instance
export const governanceService = new GovernanceService();
export default governanceService;
