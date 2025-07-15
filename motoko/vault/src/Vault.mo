import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

actor Vault {
    // Types
    public type BondId = Nat;
    public type Amount = Nat;
    public type Timestamp = Int;
    
    public type BondStatus = {
        #Active;
        #Withdrawn;
        #Liquidated;
    };
    
    public type Bond = {
        id: BondId;
        founder: Principal;
        amount: Amount;
        collateralRatio: Float;
        createdAt: Timestamp;
        status: BondStatus;
        lastUpdate: Timestamp;
    };
    
    public type VaultStats = {
        totalBonds: Nat;
        totalDeposited: Amount;
        totalWithdrawn: Amount;
        activeBonds: Nat;
        averageCollateralRatio: Float;
    };
    
    public type DepositResult = Result.Result<BondId, Text>;
    public type WithdrawResult = Result.Result<Amount, Text>;
    public type BondResult = Result.Result<Bond, Text>;
    
    // State variables
    private stable var nextBondId: BondId = 1;
    private stable var totalDeposited: Amount = 0;
    private stable var totalWithdrawn: Amount = 0;
    private stable var minCollateralRatio: Float = 1.5; // 150% minimum collateral ratio
    private stable var bondEntries: [(BondId, Bond)] = [];
    
    // Runtime state
    private var bonds = HashMap.HashMap<BondId, Bond>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private var founderBonds = HashMap.HashMap<Principal, [BondId]>(10, Principal.equal, Principal.hash);
    
    // Initialize from stable storage
    system func preupgrade() {
        bondEntries := Iter.toArray(bonds.entries());
    };
    
    system func postupgrade() {
        bonds := HashMap.fromIter<BondId, Bond>(bondEntries.vals(), bondEntries.size(), Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
        bondEntries := [];
        
        // Rebuild founder bonds index
        for ((bondId, bond) in bonds.entries()) {
            let existingBonds = switch (founderBonds.get(bond.founder)) {
                case (?bonds) bonds;
                case null [];
            };
            founderBonds.put(bond.founder, Array.append(existingBonds, [bondId]));
        };
    };
    
    // Public functions
    
    /// Deposit a bond with specified amount and collateral ratio
    public shared(msg) func depositBond(amount: Amount, collateralRatio: Float) : async DepositResult {
        let caller = msg.caller;
        
        // Validate inputs
        if (amount == 0) {
            return #err("Bond amount must be greater than 0");
        };
        
        if (collateralRatio < minCollateralRatio) {
            return #err("Collateral ratio must be at least " # Float.toText(minCollateralRatio));
        };
        
        let bondId = nextBondId;
        let now = Time.now();
        
        let bond: Bond = {
            id = bondId;
            founder = caller;
            amount = amount;
            collateralRatio = collateralRatio;
            createdAt = now;
            status = #Active;
            lastUpdate = now;
        };
        
        // Store bond
        bonds.put(bondId, bond);
        
        // Update founder bonds index
        let existingBonds = switch (founderBonds.get(caller)) {
            case (?bonds) bonds;
            case null [];
        };
        founderBonds.put(caller, Array.append(existingBonds, [bondId]));
        
        // Update state
        nextBondId += 1;
        totalDeposited += amount;
        
        Debug.print("Bond deposited: ID=" # Nat.toText(bondId) # ", Amount=" # Nat.toText(amount) # ", Founder=" # Principal.toText(caller));
        
        #ok(bondId)
    };
    
    /// Withdraw a bond by ID
    public shared(msg) func withdrawBond(bondId: BondId) : async WithdrawResult {
        let caller = msg.caller;
        
        switch (bonds.get(bondId)) {
            case (?bond) {
                // Verify ownership
                if (bond.founder != caller) {
                    return #err("Only bond owner can withdraw");
                };
                
                // Check if bond is active
                if (bond.status != #Active) {
                    return #err("Bond is not active");
                };
                
                // Update bond status
                let updatedBond: Bond = {
                    id = bond.id;
                    founder = bond.founder;
                    amount = bond.amount;
                    collateralRatio = bond.collateralRatio;
                    createdAt = bond.createdAt;
                    status = #Withdrawn;
                    lastUpdate = Time.now();
                };
                
                bonds.put(bondId, updatedBond);
                totalWithdrawn += bond.amount;
                
                Debug.print("Bond withdrawn: ID=" # Nat.toText(bondId) # ", Amount=" # Nat.toText(bond.amount));
                
                #ok(bond.amount)
            };
            case null {
                #err("Bond not found")
            };
        }
    };
    
    /// Get bond details by ID
    public query func getBond(bondId: BondId) : async BondResult {
        switch (bonds.get(bondId)) {
            case (?bond) #ok(bond);
            case null #err("Bond not found");
        }
    };
    
    /// Get all bonds for a founder
    public query func getFounderBonds(founder: Principal) : async [Bond] {
        switch (founderBonds.get(founder)) {
            case (?bondIds) {
                Array.mapFilter<BondId, Bond>(bondIds, func(bondId) {
                    bonds.get(bondId)
                })
            };
            case null [];
        }
    };
    
    /// Get vault statistics
    public query func getVaultStats() : async VaultStats {
        let allBonds = Iter.toArray(bonds.vals());
        let activeBonds = Array.filter<Bond>(allBonds, func(bond) { bond.status == #Active });
        
        let totalCollateralRatio = Array.foldLeft<Bond, Float>(activeBonds, 0.0, func(acc, bond) {
            acc + bond.collateralRatio
        });
        
        let averageCollateralRatio = if (activeBonds.size() > 0) {
            totalCollateralRatio / Float.fromInt(activeBonds.size())
        } else {
            0.0
        };
        
        {
            totalBonds = allBonds.size();
            totalDeposited = totalDeposited;
            totalWithdrawn = totalWithdrawn;
            activeBonds = activeBonds.size();
            averageCollateralRatio = averageCollateralRatio;
        }
    };
    
    /// Update minimum collateral ratio (admin function)
    public shared(msg) func updateMinCollateralRatio(newRatio: Float) : async Result.Result<(), Text> {
        // In a real implementation, you'd check for admin privileges here
        if (newRatio <= 1.0) {
            return #err("Minimum collateral ratio must be greater than 1.0");
        };
        
        minCollateralRatio := newRatio;
        Debug.print("Minimum collateral ratio updated to: " # Float.toText(newRatio));
        #ok(())
    };
    
    /// Get minimum collateral ratio
    public query func getMinCollateralRatio() : async Float {
        minCollateralRatio
    };
    
    /// Liquidate a bond (admin function for undercollateralized bonds)
    public shared(msg) func liquidateBond(bondId: BondId) : async Result.Result<(), Text> {
        switch (bonds.get(bondId)) {
            case (?bond) {
                if (bond.status != #Active) {
                    return #err("Bond is not active");
                };
                
                // In a real implementation, you'd check collateral value here
                let updatedBond: Bond = {
                    id = bond.id;
                    founder = bond.founder;
                    amount = bond.amount;
                    collateralRatio = bond.collateralRatio;
                    createdAt = bond.createdAt;
                    status = #Liquidated;
                    lastUpdate = Time.now();
                };
                
                bonds.put(bondId, updatedBond);
                Debug.print("Bond liquidated: ID=" # Nat.toText(bondId));
                #ok(())
            };
            case null {
                #err("Bond not found")
            };
        }
    };
}
