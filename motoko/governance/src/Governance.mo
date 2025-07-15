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

actor Governance {
    // Types
    public type ProposalId = Nat;
    public type TokenAmount = Nat;
    public type Timestamp = Int;
    public type VotingPower = Nat;
    
    public type ProposalType = {
        #ParameterChange;
        #BondFloorUpdate;
        #SystemUpgrade;
        #TreasuryAction;
        #Other;
    };
    
    public type ProposalStatus = {
        #Active;
        #Passed;
        #Rejected;
        #Executed;
        #Cancelled;
    };
    
    public type Vote = {
        #Yes;
        #No;
        #Abstain;
    };
    
    public type Proposal = {
        id: ProposalId;
        proposer: Principal;
        title: Text;
        description: Text;
        proposalType: ProposalType;
        createdAt: Timestamp;
        votingDeadline: Timestamp;
        status: ProposalStatus;
        yesVotes: VotingPower;
        noVotes: VotingPower;
        abstainVotes: VotingPower;
        totalVotingPower: VotingPower;
        executionPayload: ?Text; // JSON or other format for execution
    };
    
    public type VoteRecord = {
        voter: Principal;
        vote: Vote;
        votingPower: VotingPower;
        timestamp: Timestamp;
    };
    
    public type TokenHolder = {
        principal: Principal;
        tokenBalance: TokenAmount;
        votingPower: VotingPower;
        delegatedTo: ?Principal;
    };
    
    public type GovernanceStats = {
        totalProposals: Nat;
        activeProposals: Nat;
        totalTokenSupply: TokenAmount;
        totalVotingPower: VotingPower;
        participationRate: Float;
    };
    
    public type ProposalResult = Result.Result<ProposalId, Text>;
    public type VoteResult = Result.Result<(), Text>;
    
    // State variables
    private stable var nextProposalId: ProposalId = 1;
    private stable var totalTokenSupply: TokenAmount = 1000000; // Initial supply
    private stable var bondFloor: TokenAmount = 10000; // Minimum bond amount
    private stable var votingPeriodDays: Nat = 7; // 7 days voting period
    private stable var quorumThreshold: Float = 0.1; // 10% quorum required
    private stable var passingThreshold: Float = 0.5; // 50% to pass
    private stable var proposalEntries: [(ProposalId, Proposal)] = [];
    private stable var tokenHolderEntries: [(Principal, TokenHolder)] = [];
    
    // Runtime state
    private var proposals = HashMap.HashMap<ProposalId, Proposal>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private var tokenHolders = HashMap.HashMap<Principal, TokenHolder>(10, Principal.equal, Principal.hash);
    private var proposalVotes = HashMap.HashMap<ProposalId, [VoteRecord]>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private var voterProposals = HashMap.HashMap<Principal, [ProposalId]>(10, Principal.equal, Principal.hash);
    
    // Initialize from stable storage
    system func preupgrade() {
        proposalEntries := Iter.toArray(proposals.entries());
        tokenHolderEntries := Iter.toArray(tokenHolders.entries());
    };
    
    system func postupgrade() {
        proposals := HashMap.fromIter<ProposalId, Proposal>(proposalEntries.vals(), proposalEntries.size(), Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
        tokenHolders := HashMap.fromIter<Principal, TokenHolder>(tokenHolderEntries.vals(), tokenHolderEntries.size(), Principal.equal, Principal.hash);
        proposalEntries := [];
        tokenHolderEntries := [];
    };
    
    // Public functions
    
    /// Register or update a token holder
    public shared(msg) func registerTokenHolder(principal: Principal, tokenBalance: TokenAmount) : async Result.Result<(), Text> {
        if (tokenBalance == 0) {
            return #err("Token balance must be greater than 0");
        };
        
        let votingPower = calculateVotingPower(tokenBalance);
        
        let tokenHolder: TokenHolder = {
            principal = principal;
            tokenBalance = tokenBalance;
            votingPower = votingPower;
            delegatedTo = null;
        };
        
        tokenHolders.put(principal, tokenHolder);
        Debug.print("Token holder registered: " # Principal.toText(principal) # " with " # Nat.toText(tokenBalance) # " tokens");
        #ok(())
    };
    
    /// Create a new proposal
    public shared(msg) func createProposal(
        title: Text,
        description: Text,
        proposalType: ProposalType,
        executionPayload: ?Text
    ) : async ProposalResult {
        let caller = msg.caller;
        
        // Check if caller has tokens
        switch (tokenHolders.get(caller)) {
            case (?tokenHolder) {
                if (tokenHolder.tokenBalance < 1000) { // Minimum 1000 tokens to propose
                    return #err("Insufficient tokens to create proposal");
                };
            };
            case null {
                return #err("Must be a token holder to create proposals");
            };
        };
        
        let proposalId = nextProposalId;
        let now = Time.now();
        let votingDeadline = now + (votingPeriodDays * 24 * 60 * 60 * 1_000_000_000); // Convert days to nanoseconds
        
        let proposal: Proposal = {
            id = proposalId;
            proposer = caller;
            title = title;
            description = description;
            proposalType = proposalType;
            createdAt = now;
            votingDeadline = votingDeadline;
            status = #Active;
            yesVotes = 0;
            noVotes = 0;
            abstainVotes = 0;
            totalVotingPower = calculateTotalVotingPower();
            executionPayload = executionPayload;
        };
        
        proposals.put(proposalId, proposal);
        proposalVotes.put(proposalId, []);
        nextProposalId += 1;
        
        Debug.print("Proposal created: ID=" # Nat.toText(proposalId) # ", Title=" # title);
        #ok(proposalId)
    };
    
    /// Vote on a proposal
    public shared(msg) func vote(proposalId: ProposalId, voteChoice: Vote) : async VoteResult {
        let caller = msg.caller;
        
        // Get proposal
        switch (proposals.get(proposalId)) {
            case (?proposal) {
                // Check if proposal is active
                if (proposal.status != #Active) {
                    return #err("Proposal is not active");
                };
                
                // Check if voting period has ended
                if (Time.now() > proposal.votingDeadline) {
                    // Auto-finalize expired proposal
                    ignore await finalizeProposal(proposalId);
                    return #err("Voting period has ended");
                };
                
                // Get voter's voting power
                let votingPower = switch (tokenHolders.get(caller)) {
                    case (?tokenHolder) {
                        // Check for delegation
                        switch (tokenHolder.delegatedTo) {
                            case (?delegate) {
                                if (delegate != caller) {
                                    return #err("Voting power has been delegated");
                                };
                            };
                            case null {};
                        };
                        tokenHolder.votingPower
                    };
                    case null {
                        return #err("Must be a token holder to vote");
                    };
                };
                
                // Check if already voted
                let existingVotes = switch (proposalVotes.get(proposalId)) {
                    case (?votes) votes;
                    case null [];
                };
                
                let hasVoted = Array.find<VoteRecord>(existingVotes, func(record) {
                    record.voter == caller
                });
                
                if (hasVoted != null) {
                    return #err("Already voted on this proposal");
                };
                
                // Record vote
                let voteRecord: VoteRecord = {
                    voter = caller;
                    vote = voteChoice;
                    votingPower = votingPower;
                    timestamp = Time.now();
                };
                
                let updatedVotes = Array.append(existingVotes, [voteRecord]);
                proposalVotes.put(proposalId, updatedVotes);
                
                // Update proposal vote counts
                let (newYesVotes, newNoVotes, newAbstainVotes) = switch (voteChoice) {
                    case (#Yes) (proposal.yesVotes + votingPower, proposal.noVotes, proposal.abstainVotes);
                    case (#No) (proposal.yesVotes, proposal.noVotes + votingPower, proposal.abstainVotes);
                    case (#Abstain) (proposal.yesVotes, proposal.noVotes, proposal.abstainVotes + votingPower);
                };
                
                let updatedProposal: Proposal = {
                    id = proposal.id;
                    proposer = proposal.proposer;
                    title = proposal.title;
                    description = proposal.description;
                    proposalType = proposal.proposalType;
                    createdAt = proposal.createdAt;
                    votingDeadline = proposal.votingDeadline;
                    status = proposal.status;
                    yesVotes = newYesVotes;
                    noVotes = newNoVotes;
                    abstainVotes = newAbstainVotes;
                    totalVotingPower = proposal.totalVotingPower;
                    executionPayload = proposal.executionPayload;
                };
                
                proposals.put(proposalId, updatedProposal);
                
                // Update voter's proposal list
                let voterProposalList = switch (voterProposals.get(caller)) {
                    case (?list) list;
                    case null [];
                };
                voterProposals.put(caller, Array.append(voterProposalList, [proposalId]));
                
                Debug.print("Vote recorded: Proposal=" # Nat.toText(proposalId) # ", Voter=" # Principal.toText(caller) # ", Vote=" # debug_show(voteChoice));
                #ok(())
            };
            case null {
                #err("Proposal not found")
            };
        }
    };
    
    /// Finalize a proposal after voting period
    public shared(msg) func finalizeProposal(proposalId: ProposalId) : async Result.Result<(), Text> {
        switch (proposals.get(proposalId)) {
            case (?proposal) {
                if (proposal.status != #Active) {
                    return #err("Proposal is not active");
                };
                
                if (Time.now() <= proposal.votingDeadline) {
                    return #err("Voting period has not ended");
                };
                
                let totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
                let quorumMet = Float.fromInt(totalVotes) >= (Float.fromInt(proposal.totalVotingPower) * quorumThreshold);
                
                let newStatus = if (not quorumMet) {
                    #Rejected // Failed quorum
                } else {
                    let yesPercentage = Float.fromInt(proposal.yesVotes) / Float.fromInt(totalVotes);
                    if (yesPercentage >= passingThreshold) {
                        #Passed
                    } else {
                        #Rejected
                    }
                };
                
                let updatedProposal: Proposal = {
                    id = proposal.id;
                    proposer = proposal.proposer;
                    title = proposal.title;
                    description = proposal.description;
                    proposalType = proposal.proposalType;
                    createdAt = proposal.createdAt;
                    votingDeadline = proposal.votingDeadline;
                    status = newStatus;
                    yesVotes = proposal.yesVotes;
                    noVotes = proposal.noVotes;
                    abstainVotes = proposal.abstainVotes;
                    totalVotingPower = proposal.totalVotingPower;
                    executionPayload = proposal.executionPayload;
                };
                
                proposals.put(proposalId, updatedProposal);
                Debug.print("Proposal finalized: ID=" # Nat.toText(proposalId) # ", Status=" # debug_show(newStatus));
                #ok(())
            };
            case null {
                #err("Proposal not found")
            };
        }
    };
    
    /// Get proposal by ID
    public query func getProposal(proposalId: ProposalId) : async Result.Result<Proposal, Text> {
        switch (proposals.get(proposalId)) {
            case (?proposal) #ok(proposal);
            case null #err("Proposal not found");
        }
    };
    
    /// Get all active proposals
    public query func getActiveProposals() : async [Proposal] {
        let allProposals = Iter.toArray(proposals.vals());
        Array.filter<Proposal>(allProposals, func(proposal) {
            proposal.status == #Active and Time.now() <= proposal.votingDeadline
        })
    };
    
    /// Get token holder information
    public query func getTokenHolder(principal: Principal) : async Result.Result<TokenHolder, Text> {
        switch (tokenHolders.get(principal)) {
            case (?holder) #ok(holder);
            case null #err("Token holder not found");
        }
    };
    
    /// Get governance statistics
    public query func getGovernanceStats() : async GovernanceStats {
        let allProposals = Iter.toArray(proposals.vals());
        let activeProposals = Array.filter<Proposal>(allProposals, func(proposal) {
            proposal.status == #Active
        });
        
        let totalVotingPower = calculateTotalVotingPower();
        let participationRate = if (totalVotingPower > 0) {
            Float.fromInt(Array.foldLeft<Proposal, Nat>(activeProposals, 0, func(acc, proposal) {
                acc + proposal.yesVotes + proposal.noVotes + proposal.abstainVotes
            })) / Float.fromInt(totalVotingPower * activeProposals.size())
        } else {
            0.0
        };
        
        {
            totalProposals = allProposals.size();
            activeProposals = activeProposals.size();
            totalTokenSupply = totalTokenSupply;
            totalVotingPower = totalVotingPower;
            participationRate = participationRate;
        }
    };
    
    /// Update bond floor (executed proposal)
    public shared(msg) func updateBondFloor(newBondFloor: TokenAmount) : async Result.Result<(), Text> {
        // In a real implementation, this would check if called by governance execution
        bondFloor := newBondFloor;
        Debug.print("Bond floor updated to: " # Nat.toText(newBondFloor));
        #ok(())
    };
    
    /// Get current bond floor
    public query func getBondFloor() : async TokenAmount {
        bondFloor
    };
    
    // Private helper functions
    private func calculateVotingPower(tokenBalance: TokenAmount) : VotingPower {
        // Simple 1:1 mapping, could be more complex (e.g., square root)
        tokenBalance
    };
    
    private func calculateTotalVotingPower() : VotingPower {
        Array.foldLeft<TokenHolder, VotingPower>(Iter.toArray(tokenHolders.vals()), 0, func(acc, holder) {
            acc + holder.votingPower
        })
    };
}
