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

actor Splitter {
    // Types
    public type Amount = Nat;
    public type Timestamp = Int;
    public type DistributionId = Nat;
    public type Percentage = Float; // 0.0 to 1.0
    
    public type Recipient = {
        principal: Principal;
        percentage: Percentage;
        role: RecipientRole;
    };
    
    public type RecipientRole = {
        #Developer;
        #Founder;
        #Investor;
        #Other;
    };
    
    public type Distribution = {
        id: DistributionId;
        totalAmount: Amount;
        timestamp: Timestamp;
        recipients: [DistributionRecord];
        status: DistributionStatus;
    };
    
    public type DistributionRecord = {
        recipient: Principal;
        amount: Amount;
        role: RecipientRole;
        claimed: Bool;
    };
    
    public type DistributionStatus = {
        #Pending;
        #Completed;
        #Failed;
    };
    
    public type SplitterStats = {
        totalDistributions: Nat;
        totalRevenue: Amount;
        totalDeveloperShare: Amount;
        totalFounderShare: Amount;
        pendingClaims: Amount;
    };
    
    public type DistributionResult = Result.Result<DistributionId, Text>;
    public type ClaimResult = Result.Result<Amount, Text>;
    
    // State variables
    private stable var nextDistributionId: DistributionId = 1;
    private stable var totalRevenue: Amount = 0;
    private stable var totalDeveloperShare: Amount = 0;
    private stable var totalFounderShare: Amount = 0;
    private stable var developerFirstPercentage: Percentage = 0.6; // 60% to developers first
    private stable var distributionEntries: [(DistributionId, Distribution)] = [];
    private stable var recipientEntries: [(Principal, Recipient)] = [];
    
    // Runtime state
    private var distributions = HashMap.HashMap<DistributionId, Distribution>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private var recipients = HashMap.HashMap<Principal, Recipient>(10, Principal.equal, Principal.hash);
    private var pendingClaims = HashMap.HashMap<Principal, Amount>(10, Principal.equal, Principal.hash);
    
    // Initialize from stable storage
    system func preupgrade() {
        distributionEntries := Iter.toArray(distributions.entries());
        recipientEntries := Iter.toArray(recipients.entries());
    };
    
    system func postupgrade() {
        distributions := HashMap.fromIter<DistributionId, Distribution>(distributionEntries.vals(), distributionEntries.size(), Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
        recipients := HashMap.fromIter<Principal, Recipient>(recipientEntries.vals(), recipientEntries.size(), Principal.equal, Principal.hash);
        distributionEntries := [];
        recipientEntries := [];
        
        // Rebuild pending claims
        for ((_, distribution) in distributions.entries()) {
            if (distribution.status == #Pending or distribution.status == #Completed) {
                for (record in distribution.recipients.vals()) {
                    if (not record.claimed) {
                        let currentPending = switch (pendingClaims.get(record.recipient)) {
                            case (?amount) amount;
                            case null 0;
                        };
                        pendingClaims.put(record.recipient, currentPending + record.amount);
                    };
                };
            };
        };
    };
    
    // Public functions
    
    /// Add or update a recipient
    public shared(msg) func addRecipient(principal: Principal, percentage: Percentage, role: RecipientRole) : async Result.Result<(), Text> {
        // Validate percentage
        if (percentage <= 0.0 or percentage > 1.0) {
            return #err("Percentage must be between 0 and 1");
        };
        
        let recipient: Recipient = {
            principal = principal;
            percentage = percentage;
            role = role;
        };
        
        recipients.put(principal, recipient);
        Debug.print("Recipient added: " # Principal.toText(principal) # " with " # Float.toText(percentage * 100.0) # "%");
        #ok(())
    };
    
    /// Remove a recipient
    public shared(msg) func removeRecipient(principal: Principal) : async Result.Result<(), Text> {
        switch (recipients.remove(principal)) {
            case (?_) {
                Debug.print("Recipient removed: " # Principal.toText(principal));
                #ok(())
            };
            case null #err("Recipient not found");
        }
    };
    
    /// Distribute revenue with developer-first allocation
    public shared(msg) func distributeRevenue(totalAmount: Amount) : async DistributionResult {
        if (totalAmount == 0) {
            return #err("Distribution amount must be greater than 0");
        };
        
        let distributionId = nextDistributionId;
        let now = Time.now();
        
        // Get all recipients
        let allRecipients = Iter.toArray(recipients.vals());
        if (allRecipients.size() == 0) {
            return #err("No recipients configured");
        };
        
        // Separate developers and others
        let developers = Array.filter<Recipient>(allRecipients, func(r) { r.role == #Developer });
        let others = Array.filter<Recipient>(allRecipients, func(r) { r.role != #Developer });
        
        // Calculate developer-first allocation
        let developerAmount = Float.toInt(Float.fromInt(totalAmount) * developerFirstPercentage);
        let remainingAmount = totalAmount - Int.abs(developerAmount);
        
        var distributionRecords: [DistributionRecord] = [];
        
        // Distribute to developers first
        if (developers.size() > 0) {
            let totalDeveloperPercentage = Array.foldLeft<Recipient, Float>(developers, 0.0, func(acc, r) { acc + r.percentage });
            
            for (dev in developers.vals()) {
                let devShare = if (totalDeveloperPercentage > 0.0) {
                    Float.toInt(Float.fromInt(Int.abs(developerAmount)) * (dev.percentage / totalDeveloperPercentage))
                } else {
                    0
                };
                
                let record: DistributionRecord = {
                    recipient = dev.principal;
                    amount = Int.abs(devShare);
                    role = dev.role;
                    claimed = false;
                };
                
                distributionRecords := Array.append(distributionRecords, [record]);
                
                // Update pending claims
                let currentPending = switch (pendingClaims.get(dev.principal)) {
                    case (?amount) amount;
                    case null 0;
                };
                pendingClaims.put(dev.principal, currentPending + Int.abs(devShare));
            };
        };
        
        // Distribute remaining to all recipients (including founders)
        if (others.size() > 0 and remainingAmount > 0) {
            let totalOtherPercentage = Array.foldLeft<Recipient, Float>(others, 0.0, func(acc, r) { acc + r.percentage });
            
            for (other in others.vals()) {
                let otherShare = if (totalOtherPercentage > 0.0) {
                    Float.toInt(Float.fromInt(remainingAmount) * (other.percentage / totalOtherPercentage))
                } else {
                    0
                };
                
                let record: DistributionRecord = {
                    recipient = other.principal;
                    amount = Int.abs(otherShare);
                    role = other.role;
                    claimed = false;
                };
                
                distributionRecords := Array.append(distributionRecords, [record]);
                
                // Update pending claims
                let currentPending = switch (pendingClaims.get(other.principal)) {
                    case (?amount) amount;
                    case null 0;
                };
                pendingClaims.put(other.principal, currentPending + Int.abs(otherShare));
                
                // Track founder share
                if (other.role == #Founder) {
                    totalFounderShare += Int.abs(otherShare);
                };
            };
        };
        
        let distribution: Distribution = {
            id = distributionId;
            totalAmount = totalAmount;
            timestamp = now;
            recipients = distributionRecords;
            status = #Completed;
        };
        
        distributions.put(distributionId, distribution);
        nextDistributionId += 1;
        totalRevenue += totalAmount;
        totalDeveloperShare += Int.abs(developerAmount);
        
        Debug.print("Revenue distributed: ID=" # Nat.toText(distributionId) # ", Total=" # Nat.toText(totalAmount));
        #ok(distributionId)
    };
    
    /// Claim pending distribution
    public shared(msg) func claimDistribution() : async ClaimResult {
        let caller = msg.caller;
        
        switch (pendingClaims.get(caller)) {
            case (?amount) {
                if (amount == 0) {
                    return #err("No pending claims");
                };
                
                // Mark all distributions as claimed for this recipient
                for ((distId, distribution) in distributions.entries()) {
                    let updatedRecords = Array.map<DistributionRecord, DistributionRecord>(distribution.recipients, func(record) {
                        if (record.recipient == caller and not record.claimed) {
                            {
                                recipient = record.recipient;
                                amount = record.amount;
                                role = record.role;
                                claimed = true;
                            }
                        } else {
                            record
                        }
                    });
                    
                    let updatedDistribution: Distribution = {
                        id = distribution.id;
                        totalAmount = distribution.totalAmount;
                        timestamp = distribution.timestamp;
                        recipients = updatedRecords;
                        status = distribution.status;
                    };
                    
                    distributions.put(distId, updatedDistribution);
                };
                
                pendingClaims.put(caller, 0);
                Debug.print("Distribution claimed: " # Principal.toText(caller) # ", Amount=" # Nat.toText(amount));
                #ok(amount)
            };
            case null #err("No pending claims");
        }
    };
    
    /// Get pending claims for caller
    public shared(msg) func getPendingClaims() : async Amount {
        let caller = msg.caller;
        switch (pendingClaims.get(caller)) {
            case (?amount) amount;
            case null 0;
        }
    };
    
    /// Get distribution by ID
    public query func getDistribution(distributionId: DistributionId) : async Result.Result<Distribution, Text> {
        switch (distributions.get(distributionId)) {
            case (?distribution) #ok(distribution);
            case null #err("Distribution not found");
        }
    };
    
    /// Get all recipients
    public query func getRecipients() : async [Recipient] {
        Iter.toArray(recipients.vals())
    };
    
    /// Get splitter statistics
    public query func getSplitterStats() : async SplitterStats {
        let totalPendingClaims = Array.foldLeft<Amount, Amount>(Iter.toArray(pendingClaims.vals()), 0, func(acc, amount) { acc + amount });
        
        {
            totalDistributions = distributions.size();
            totalRevenue = totalRevenue;
            totalDeveloperShare = totalDeveloperShare;
            totalFounderShare = totalFounderShare;
            pendingClaims = totalPendingClaims;
        }
    };
    
    /// Update developer-first percentage (admin function)
    public shared(msg) func updateDeveloperFirstPercentage(newPercentage: Percentage) : async Result.Result<(), Text> {
        if (newPercentage < 0.0 or newPercentage > 1.0) {
            return #err("Percentage must be between 0 and 1");
        };
        
        developerFirstPercentage := newPercentage;
        Debug.print("Developer-first percentage updated to: " # Float.toText(newPercentage * 100.0) # "%");
        #ok(())
    };
    
    /// Get developer-first percentage
    public query func getDeveloperFirstPercentage() : async Percentage {
        developerFirstPercentage
    };
}
