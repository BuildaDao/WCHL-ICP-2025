import { IDL } from '@dfinity/candid';

// Vault Candid Interface Definition
export const VaultIDL = IDL.Service({
  // Types
  'BondId': IDL.Nat,
  'Amount': IDL.Nat,
  'Timestamp': IDL.Int,
  
  'BondStatus': IDL.Variant({
    'Active': IDL.Null,
    'Withdrawn': IDL.Null,
    'Liquidated': IDL.Null,
  }),
  
  'Bond': IDL.Record({
    'id': IDL.Nat,
    'founder': IDL.Principal,
    'amount': IDL.Nat,
    'collateralRatio': IDL.Float64,
    'createdAt': IDL.Int,
    'status': IDL.Variant({
      'Active': IDL.Null,
      'Withdrawn': IDL.Null,
      'Liquidated': IDL.Null,
    }),
    'lastUpdate': IDL.Int,
  }),
  
  'VaultStats': IDL.Record({
    'totalBonds': IDL.Nat,
    'totalDeposited': IDL.Nat,
    'totalWithdrawn': IDL.Nat,
    'activeBonds': IDL.Nat,
    'averageCollateralRatio': IDL.Float64,
  }),
  
  'DepositResult': IDL.Variant({
    'ok': IDL.Nat,
    'err': IDL.Text,
  }),
  
  'WithdrawResult': IDL.Variant({
    'ok': IDL.Nat,
    'err': IDL.Text,
  }),
  
  'BondResult': IDL.Variant({
    'ok': IDL.Record({
      'id': IDL.Nat,
      'founder': IDL.Principal,
      'amount': IDL.Nat,
      'collateralRatio': IDL.Float64,
      'createdAt': IDL.Int,
      'status': IDL.Variant({
        'Active': IDL.Null,
        'Withdrawn': IDL.Null,
        'Liquidated': IDL.Null,
      }),
      'lastUpdate': IDL.Int,
    }),
    'err': IDL.Text,
  }),
  
  // Public functions
  'depositBond': IDL.Func(
    [IDL.Nat, IDL.Float64], // amount, collateralRatio
    [IDL.Variant({
      'ok': IDL.Nat,
      'err': IDL.Text,
    })],
    []
  ),
  
  'withdrawBond': IDL.Func(
    [IDL.Nat], // bondId
    [IDL.Variant({
      'ok': IDL.Nat,
      'err': IDL.Text,
    })],
    []
  ),
  
  'getBond': IDL.Func(
    [IDL.Nat], // bondId
    [IDL.Variant({
      'ok': IDL.Record({
        'id': IDL.Nat,
        'founder': IDL.Principal,
        'amount': IDL.Nat,
        'collateralRatio': IDL.Float64,
        'createdAt': IDL.Int,
        'status': IDL.Variant({
          'Active': IDL.Null,
          'Withdrawn': IDL.Null,
          'Liquidated': IDL.Null,
        }),
        'lastUpdate': IDL.Int,
      }),
      'err': IDL.Text,
    })],
    ['query']
  ),
  
  'getFounderBonds': IDL.Func(
    [IDL.Principal], // founder
    [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'founder': IDL.Principal,
      'amount': IDL.Nat,
      'collateralRatio': IDL.Float64,
      'createdAt': IDL.Int,
      'status': IDL.Variant({
        'Active': IDL.Null,
        'Withdrawn': IDL.Null,
        'Liquidated': IDL.Null,
      }),
      'lastUpdate': IDL.Int,
    }))],
    ['query']
  ),
  
  'getVaultStats': IDL.Func(
    [],
    [IDL.Record({
      'totalBonds': IDL.Nat,
      'totalDeposited': IDL.Nat,
      'totalWithdrawn': IDL.Nat,
      'activeBonds': IDL.Nat,
      'averageCollateralRatio': IDL.Float64,
    })],
    ['query']
  ),
  
  'updateMinCollateralRatio': IDL.Func(
    [IDL.Float64], // newRatio
    [IDL.Variant({
      'ok': IDL.Null,
      'err': IDL.Text,
    })],
    []
  ),
  
  'getMinCollateralRatio': IDL.Func(
    [],
    [IDL.Float64],
    ['query']
  ),
  
  'liquidateBond': IDL.Func(
    [IDL.Nat], // bondId
    [IDL.Variant({
      'ok': IDL.Null,
      'err': IDL.Text,
    })],
    []
  ),
});

export default VaultIDL;
