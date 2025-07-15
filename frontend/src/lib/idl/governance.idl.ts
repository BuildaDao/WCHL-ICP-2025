import { IDL } from '@dfinity/candid';

// Governance Candid Interface Definition
export const GovernanceIDL = IDL.Service({
  'ProposalId': IDL.Nat,
  'VotingPower': IDL.Nat,
  'TokenAmount': IDL.Nat,
  'Timestamp': IDL.Int,
  
  'ProposalType': IDL.Variant({
    'ParameterChange': IDL.Null,
    'BondFloorUpdate': IDL.Null,
    'SystemUpgrade': IDL.Null,
    'TreasuryAction': IDL.Null,
    'Other': IDL.Null,
  }),
  
  'ProposalStatus': IDL.Variant({
    'Active': IDL.Null,
    'Passed': IDL.Null,
    'Rejected': IDL.Null,
    'Executed': IDL.Null,
    'Cancelled': IDL.Null,
  }),
  
  'Vote': IDL.Variant({
    'Yes': IDL.Null,
    'No': IDL.Null,
    'Abstain': IDL.Null,
  }),
  
  'Proposal': IDL.Record({
    'id': IDL.Nat,
    'proposer': IDL.Principal,
    'title': IDL.Text,
    'description': IDL.Text,
    'proposalType': IDL.Variant({
      'ParameterChange': IDL.Null,
      'BondFloorUpdate': IDL.Null,
      'SystemUpgrade': IDL.Null,
      'TreasuryAction': IDL.Null,
      'Other': IDL.Null,
    }),
    'createdAt': IDL.Int,
    'votingDeadline': IDL.Int,
    'status': IDL.Variant({
      'Active': IDL.Null,
      'Passed': IDL.Null,
      'Rejected': IDL.Null,
      'Executed': IDL.Null,
      'Cancelled': IDL.Null,
    }),
    'yesVotes': IDL.Nat,
    'noVotes': IDL.Nat,
    'abstainVotes': IDL.Nat,
    'totalVotingPower': IDL.Nat,
    'executionPayload': IDL.Opt(IDL.Text),
  }),
  
  'GovernanceStats': IDL.Record({
    'totalProposals': IDL.Nat,
    'activeProposals': IDL.Nat,
    'totalTokenSupply': IDL.Nat,
    'totalVotingPower': IDL.Nat,
    'participationRate': IDL.Float64,
  }),
  
  // Public functions
  'createProposal': IDL.Func(
    [IDL.Text, IDL.Text, IDL.Variant({
      'ParameterChange': IDL.Null,
      'BondFloorUpdate': IDL.Null,
      'SystemUpgrade': IDL.Null,
      'TreasuryAction': IDL.Null,
      'Other': IDL.Null,
    }), IDL.Opt(IDL.Text)], // title, description, proposalType, executionPayload
    [IDL.Variant({
      'ok': IDL.Nat,
      'err': IDL.Text,
    })],
    []
  ),
  
  'vote': IDL.Func(
    [IDL.Nat, IDL.Variant({
      'Yes': IDL.Null,
      'No': IDL.Null,
      'Abstain': IDL.Null,
    })], // proposalId, vote
    [IDL.Variant({
      'ok': IDL.Null,
      'err': IDL.Text,
    })],
    []
  ),
  
  'getProposal': IDL.Func(
    [IDL.Nat], // proposalId
    [IDL.Opt(IDL.Record({
      'id': IDL.Nat,
      'proposer': IDL.Principal,
      'title': IDL.Text,
      'description': IDL.Text,
      'proposalType': IDL.Variant({
        'ParameterChange': IDL.Null,
        'BondFloorUpdate': IDL.Null,
        'SystemUpgrade': IDL.Null,
        'TreasuryAction': IDL.Null,
        'Other': IDL.Null,
      }),
      'createdAt': IDL.Int,
      'votingDeadline': IDL.Int,
      'status': IDL.Variant({
        'Active': IDL.Null,
        'Passed': IDL.Null,
        'Rejected': IDL.Null,
        'Executed': IDL.Null,
        'Cancelled': IDL.Null,
      }),
      'yesVotes': IDL.Nat,
      'noVotes': IDL.Nat,
      'abstainVotes': IDL.Nat,
      'totalVotingPower': IDL.Nat,
      'executionPayload': IDL.Opt(IDL.Text),
    }))],
    ['query']
  ),
  
  'getAllProposals': IDL.Func(
    [],
    [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'proposer': IDL.Principal,
      'title': IDL.Text,
      'description': IDL.Text,
      'proposalType': IDL.Variant({
        'ParameterChange': IDL.Null,
        'BondFloorUpdate': IDL.Null,
        'SystemUpgrade': IDL.Null,
        'TreasuryAction': IDL.Null,
        'Other': IDL.Null,
      }),
      'createdAt': IDL.Int,
      'votingDeadline': IDL.Int,
      'status': IDL.Variant({
        'Active': IDL.Null,
        'Passed': IDL.Null,
        'Rejected': IDL.Null,
        'Executed': IDL.Null,
        'Cancelled': IDL.Null,
      }),
      'yesVotes': IDL.Nat,
      'noVotes': IDL.Nat,
      'abstainVotes': IDL.Nat,
      'totalVotingPower': IDL.Nat,
      'executionPayload': IDL.Opt(IDL.Text),
    }))],
    ['query']
  ),
  
  'getGovernanceStats': IDL.Func(
    [],
    [IDL.Record({
      'totalProposals': IDL.Nat,
      'activeProposals': IDL.Nat,
      'totalTokenSupply': IDL.Nat,
      'totalVotingPower': IDL.Nat,
      'participationRate': IDL.Float64,
    })],
    ['query']
  ),
  
  'getVotingPower': IDL.Func(
    [IDL.Principal], // user
    [IDL.Nat],
    ['query']
  ),
});

export default GovernanceIDL;
