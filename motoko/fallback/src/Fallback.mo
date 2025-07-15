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

actor Fallback {
    // Types
    public type Amount = Nat;
    public type Timestamp = Int;
    public type ConversionId = Nat;
    public type Threshold = Amount;
    
    public type InstrumentType = {
        #Equity;
        #Debt;
        #Hybrid;
    };
    
    public type ConversionTrigger = {
        #PaymentThreshold;
        #TimeThreshold;
        #Manual;
    };
    
    public type Conversion = {
        id: ConversionId;
        originalAmount: Amount;
        convertedAmount: Amount;
        instrumentType: InstrumentType;
        trigger: ConversionTrigger;
        recipient: Principal;
        timestamp: Timestamp;
        conversionRate: Float;
        status: ConversionStatus;
    };
    
    public type ConversionStatus = {
        #Pending;
        #Completed;
        #Failed;
        #Cancelled;
    };
    
    public type ThresholdConfig = {
        paymentThreshold: Threshold;
        timeThresholdDays: Nat;
        equityConversionRate: Float;
        debtConversionRate: Float;
        defaultInstrumentType: InstrumentType;
    };
    
    public type FallbackStats = {
        totalConversions: Nat;
        totalConvertedAmount: Amount;
        totalEquityIssued: Amount;
        totalDebtIssued: Amount;
        pendingConversions: Nat;
    };
    
    public type ConversionResult = Result.Result<ConversionId, Text>;
    
    // State variables
    private stable var nextConversionId: ConversionId = 1;
    private stable var totalConvertedAmount: Amount = 0;
    private stable var totalEquityIssued: Amount = 0;
    private stable var totalDebtIssued: Amount = 0;
    private stable var conversionEntries: [(ConversionId, Conversion)] = [];
    
    // Configuration
    private stable var thresholdConfig: ThresholdConfig = {
        paymentThreshold = 10000; // Default threshold
        timeThresholdDays = 30; // 30 days
        equityConversionRate = 1.2; // 120% conversion rate for equity
        debtConversionRate = 1.1; // 110% conversion rate for debt
        defaultInstrumentType = #Equity;
    };
    
    // Runtime state
    private var conversions = HashMap.HashMap<ConversionId, Conversion>(10, Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
    private var unpaidAmounts = HashMap.HashMap<Principal, Amount>(10, Principal.equal, Principal.hash);
    private var lastPaymentTime = HashMap.HashMap<Principal, Timestamp>(10, Principal.equal, Principal.hash);
    
    // Initialize from stable storage
    system func preupgrade() {
        conversionEntries := Iter.toArray(conversions.entries());
    };
    
    system func postupgrade() {
        conversions := HashMap.fromIter<ConversionId, Conversion>(conversionEntries.vals(), conversionEntries.size(), Nat.equal, func(n: Nat) : Nat32 { Nat32.fromNat(n) });
        conversionEntries := [];
    };
    
    // Public functions
    
    /// Record an unpaid amount for a recipient
    public shared(msg) func recordUnpaidAmount(recipient: Principal, amount: Amount) : async Result.Result<(), Text> {
        if (amount == 0) {
            return #err("Amount must be greater than 0");
        };
        
        let currentUnpaid = switch (unpaidAmounts.get(recipient)) {
            case (?existing) existing;
            case null 0;
        };
        
        unpaidAmounts.put(recipient, currentUnpaid + amount);
        lastPaymentTime.put(recipient, Time.now());
        
        Debug.print("Unpaid amount recorded: " # Principal.toText(recipient) # ", Amount=" # Nat.toText(amount));
        
        // Check if automatic conversion should be triggered
        ignore await checkAndTriggerConversion(recipient);
        
        #ok(())
    };
    
    /// Check and trigger automatic conversion based on thresholds
    private func checkAndTriggerConversion(recipient: Principal) : async () {
        let unpaidAmount = switch (unpaidAmounts.get(recipient)) {
            case (?amount) amount;
            case null 0;
        };
        
        let lastPayment = switch (lastPaymentTime.get(recipient)) {
            case (?time) time;
            case null Time.now();
        };
        
        let now = Time.now();
        let daysSinceLastPayment = (now - lastPayment) / (24 * 60 * 60 * 1_000_000_000); // Convert nanoseconds to days
        
        // Check payment threshold
        if (unpaidAmount >= thresholdConfig.paymentThreshold) {
            ignore await convertToInstrument(recipient, unpaidAmount, thresholdConfig.defaultInstrumentType, #PaymentThreshold);
            return;
        };
        
        // Check time threshold
        if (Int.abs(daysSinceLastPayment) >= thresholdConfig.timeThresholdDays and unpaidAmount > 0) {
            ignore await convertToInstrument(recipient, unpaidAmount, thresholdConfig.defaultInstrumentType, #TimeThreshold);
            return;
        };
    };
    
    /// Convert unpaid amount to equity or debt instrument
    public shared(msg) func convertToInstrument(recipient: Principal, amount: Amount, instrumentType: InstrumentType, trigger: ConversionTrigger) : async ConversionResult {
        if (amount == 0) {
            return #err("Conversion amount must be greater than 0");
        };
        
        let unpaidAmount = switch (unpaidAmounts.get(recipient)) {
            case (?existing) existing;
            case null 0;
        };
        
        if (amount > unpaidAmount) {
            return #err("Conversion amount exceeds unpaid amount");
        };
        
        let conversionRate = switch (instrumentType) {
            case (#Equity) thresholdConfig.equityConversionRate;
            case (#Debt) thresholdConfig.debtConversionRate;
            case (#Hybrid) (thresholdConfig.equityConversionRate + thresholdConfig.debtConversionRate) / 2.0;
        };
        
        let convertedAmount = Float.toInt(Float.fromInt(amount) * conversionRate);
        let conversionId = nextConversionId;
        
        let conversion: Conversion = {
            id = conversionId;
            originalAmount = amount;
            convertedAmount = Int.abs(convertedAmount);
            instrumentType = instrumentType;
            trigger = trigger;
            recipient = recipient;
            timestamp = Time.now();
            conversionRate = conversionRate;
            status = #Completed;
        };
        
        conversions.put(conversionId, conversion);
        nextConversionId += 1;
        
        // Update unpaid amounts
        unpaidAmounts.put(recipient, unpaidAmount - amount);
        
        // Update totals
        totalConvertedAmount += amount;
        switch (instrumentType) {
            case (#Equity) totalEquityIssued += Int.abs(convertedAmount);
            case (#Debt) totalDebtIssued += Int.abs(convertedAmount);
            case (#Hybrid) {
                totalEquityIssued += Int.abs(convertedAmount) / 2;
                totalDebtIssued += Int.abs(convertedAmount) / 2;
            };
        };
        
        Debug.print("Conversion completed: ID=" # Nat.toText(conversionId) # ", Type=" # debug_show(instrumentType) # ", Amount=" # Nat.toText(amount));
        
        #ok(conversionId)
    };
    
    /// Manually trigger conversion for a specific recipient
    public shared(msg) func manualConversion(recipient: Principal, amount: Amount, instrumentType: InstrumentType) : async ConversionResult {
        await convertToInstrument(recipient, amount, instrumentType, #Manual)
    };
    
    /// Get conversion by ID
    public query func getConversion(conversionId: ConversionId) : async Result.Result<Conversion, Text> {
        switch (conversions.get(conversionId)) {
            case (?conversion) #ok(conversion);
            case null #err("Conversion not found");
        }
    };
    
    /// Get all conversions for a recipient
    public query func getRecipientConversions(recipient: Principal) : async [Conversion] {
        let allConversions = Iter.toArray(conversions.vals());
        Array.filter<Conversion>(allConversions, func(conversion) {
            conversion.recipient == recipient
        })
    };
    
    /// Get unpaid amount for a recipient
    public query func getUnpaidAmount(recipient: Principal) : async Amount {
        switch (unpaidAmounts.get(recipient)) {
            case (?amount) amount;
            case null 0;
        }
    };
    
    /// Get all unpaid amounts
    public query func getAllUnpaidAmounts() : async [(Principal, Amount)] {
        Iter.toArray(unpaidAmounts.entries())
    };
    
    /// Get fallback statistics
    public query func getFallbackStats() : async FallbackStats {
        let allConversions = Iter.toArray(conversions.vals());
        let pendingConversions = Array.filter<Conversion>(allConversions, func(conversion) {
            conversion.status == #Pending
        });
        
        {
            totalConversions = allConversions.size();
            totalConvertedAmount = totalConvertedAmount;
            totalEquityIssued = totalEquityIssued;
            totalDebtIssued = totalDebtIssued;
            pendingConversions = pendingConversions.size();
        }
    };
    
    /// Update threshold configuration (admin function)
    public shared(msg) func updateThresholdConfig(newConfig: ThresholdConfig) : async Result.Result<(), Text> {
        if (newConfig.paymentThreshold == 0) {
            return #err("Payment threshold must be greater than 0");
        };
        
        if (newConfig.timeThresholdDays == 0) {
            return #err("Time threshold must be greater than 0 days");
        };
        
        if (newConfig.equityConversionRate <= 0.0 or newConfig.debtConversionRate <= 0.0) {
            return #err("Conversion rates must be greater than 0");
        };
        
        thresholdConfig := newConfig;
        Debug.print("Threshold configuration updated");
        #ok(())
    };
    
    /// Get current threshold configuration
    public query func getThresholdConfig() : async ThresholdConfig {
        thresholdConfig
    };
    
    /// Cancel a pending conversion
    public shared(msg) func cancelConversion(conversionId: ConversionId) : async Result.Result<(), Text> {
        switch (conversions.get(conversionId)) {
            case (?conversion) {
                if (conversion.status != #Pending) {
                    return #err("Can only cancel pending conversions");
                };
                
                let updatedConversion: Conversion = {
                    id = conversion.id;
                    originalAmount = conversion.originalAmount;
                    convertedAmount = conversion.convertedAmount;
                    instrumentType = conversion.instrumentType;
                    trigger = conversion.trigger;
                    recipient = conversion.recipient;
                    timestamp = conversion.timestamp;
                    conversionRate = conversion.conversionRate;
                    status = #Cancelled;
                };
                
                conversions.put(conversionId, updatedConversion);
                
                // Restore unpaid amount
                let currentUnpaid = switch (unpaidAmounts.get(conversion.recipient)) {
                    case (?amount) amount;
                    case null 0;
                };
                unpaidAmounts.put(conversion.recipient, currentUnpaid + conversion.originalAmount);
                
                Debug.print("Conversion cancelled: ID=" # Nat.toText(conversionId));
                #ok(())
            };
            case null #err("Conversion not found");
        }
    };
    
    /// Process payment and reduce unpaid amount
    public shared(msg) func processPayment(recipient: Principal, amount: Amount) : async Result.Result<(), Text> {
        if (amount == 0) {
            return #err("Payment amount must be greater than 0");
        };
        
        let unpaidAmount = switch (unpaidAmounts.get(recipient)) {
            case (?existing) existing;
            case null 0;
        };
        
        if (amount > unpaidAmount) {
            return #err("Payment amount exceeds unpaid amount");
        };
        
        unpaidAmounts.put(recipient, unpaidAmount - amount);
        lastPaymentTime.put(recipient, Time.now());
        
        Debug.print("Payment processed: " # Principal.toText(recipient) # ", Amount=" # Nat.toText(amount));
        #ok(())
    };
}
