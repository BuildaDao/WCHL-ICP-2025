import { ActorSubclass } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { createActor, callCanister, CANISTER_IDS, nanosToMillis, formatPrincipal } from '../agent';
import VaultIDL from '../idl/vault.idl';
import { 
  Bond, 
  VaultStats, 
  DepositResult, 
  WithdrawResult, 
  BondResult,
  DisplayBond,
  BondStatus 
} from '../types';

// Vault Actor Interface
interface VaultActor {
  depositBond: (amount: bigint, collateralRatio: number) => Promise<DepositResult>;
  withdrawBond: (bondId: bigint) => Promise<WithdrawResult>;
  getBond: (bondId: bigint) => Promise<BondResult>;
  getFounderBonds: (founder: Principal) => Promise<Bond[]>;
  getVaultStats: () => Promise<VaultStats>;
  updateMinCollateralRatio: (newRatio: number) => Promise<{ ok: null } | { err: string }>;
  getMinCollateralRatio: () => Promise<number>;
  liquidateBond: (bondId: bigint) => Promise<{ ok: null } | { err: string }>;
}

class VaultService {
  private actor: ActorSubclass<VaultActor> | null = null;

  /**
   * Initialize the vault actor
   */
  private async getActor(): Promise<ActorSubclass<VaultActor>> {
    if (!this.actor) {
      this.actor = await createActor<VaultActor>(CANISTER_IDS.vault, VaultIDL);
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
   * Deposit a new bond
   */
  public async depositBond(amount: number, collateralRatio: number): Promise<number | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const result = await actor.depositBond(BigInt(amount), collateralRatio);
      
      if ('ok' in result) {
        return Number(result.ok);
      } else {
        throw new Error(result.err);
      }
    }, 'Failed to deposit bond');
  }

  /**
   * Withdraw a bond
   */
  public async withdrawBond(bondId: number): Promise<number | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const result = await actor.withdrawBond(BigInt(bondId));
      
      if ('ok' in result) {
        return Number(result.ok);
      } else {
        throw new Error(result.err);
      }
    }, 'Failed to withdraw bond');
  }

  /**
   * Get bond details by ID
   */
  public async getBond(bondId: number): Promise<DisplayBond | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const result = await actor.getBond(BigInt(bondId));
      
      if ('ok' in result) {
        return this.convertBondToDisplay(result.ok);
      } else {
        throw new Error(result.err);
      }
    }, 'Failed to get bond');
  }

  /**
   * Get all bonds for the current user
   */
  public async getMyBonds(): Promise<DisplayBond[]> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      // Get current user's principal
      const identity = await import('../agent').then(m => m.getCurrentPrincipal());
      if (!identity) {
        throw new Error('User not authenticated');
      }

      const bonds = await actor.getFounderBonds(identity);
      return bonds.map(bond => this.convertBondToDisplay(bond));
    }, 'Failed to get user bonds') || [];
  }

  /**
   * Get bonds for a specific founder
   */
  public async getFounderBonds(founder: Principal): Promise<DisplayBond[]> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const bonds = await actor.getFounderBonds(founder);
      return bonds.map(bond => this.convertBondToDisplay(bond));
    }, 'Failed to get founder bonds') || [];
  }

  /**
   * Get vault statistics
   */
  public async getVaultStats(): Promise<{
    totalBonds: number;
    totalDeposited: number;
    totalWithdrawn: number;
    activeBonds: number;
    averageCollateralRatio: number;
  } | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      const stats = await actor.getVaultStats();
      
      return {
        totalBonds: Number(stats.totalBonds),
        totalDeposited: Number(stats.totalDeposited),
        totalWithdrawn: Number(stats.totalWithdrawn),
        activeBonds: Number(stats.activeBonds),
        averageCollateralRatio: stats.averageCollateralRatio,
      };
    }, 'Failed to get vault stats');
  }

  /**
   * Update minimum collateral ratio (admin function)
   */
  public async updateMinCollateralRatio(newRatio: number): Promise<boolean> {
    const actor = await this.getActor();
    
    const result = await callCanister(async () => {
      const result = await actor.updateMinCollateralRatio(newRatio);
      
      if ('ok' in result) {
        return true;
      } else {
        throw new Error(result.err);
      }
    }, 'Failed to update minimum collateral ratio');

    return result || false;
  }

  /**
   * Get minimum collateral ratio
   */
  public async getMinCollateralRatio(): Promise<number | null> {
    const actor = await this.getActor();
    
    return callCanister(async () => {
      return await actor.getMinCollateralRatio();
    }, 'Failed to get minimum collateral ratio');
  }

  /**
   * Liquidate a bond (admin function)
   */
  public async liquidateBond(bondId: number): Promise<boolean> {
    const actor = await this.getActor();
    
    const result = await callCanister(async () => {
      const result = await actor.liquidateBond(BigInt(bondId));
      
      if ('ok' in result) {
        return true;
      } else {
        throw new Error(result.err);
      }
    }, 'Failed to liquidate bond');

    return result || false;
  }

  /**
   * Convert canister Bond to DisplayBond
   */
  private convertBondToDisplay(bond: Bond): DisplayBond {
    const getStatusString = (status: BondStatus): 'Active' | 'Withdrawn' | 'Liquidated' => {
      if ('Active' in status) return 'Active';
      if ('Withdrawn' in status) return 'Withdrawn';
      if ('Liquidated' in status) return 'Liquidated';
      return 'Active'; // fallback
    };

    return {
      id: Number(bond.id),
      amount: Number(bond.amount),
      collateralRatio: bond.collateralRatio,
      status: getStatusString(bond.status),
      createdAt: new Date(nanosToMillis(bond.createdAt)).toISOString().split('T')[0],
    };
  }

  /**
   * Check if user can deposit bonds (has sufficient balance, etc.)
   */
  public async canDepositBond(amount: number): Promise<{ canDeposit: boolean; reason?: string }> {
    // In a real implementation, you'd check user's ICP balance, etc.
    if (amount <= 0) {
      return { canDeposit: false, reason: 'Amount must be greater than 0' };
    }

    const minRatio = await this.getMinCollateralRatio();
    if (!minRatio) {
      return { canDeposit: false, reason: 'Unable to verify minimum collateral ratio' };
    }

    return { canDeposit: true };
  }

  /**
   * Estimate bond creation cost
   */
  public async estimateBondCost(amount: number, collateralRatio: number): Promise<{
    bondAmount: number;
    collateralRequired: number;
    totalCost: number;
  } | null> {
    return {
      bondAmount: amount,
      collateralRequired: amount * collateralRatio,
      totalCost: amount * (1 + collateralRatio),
    };
  }
}

// Export singleton instance
export const vaultService = new VaultService();
export default vaultService;
