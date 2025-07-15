'use client';

import { useState, useEffect } from 'react';
import { vaultService, isAuthenticated, login } from '../../lib/services';

interface Bond {
  id: number;
  amount: number;
  collateralRatio: number;
  status: 'Active' | 'Withdrawn' | 'Liquidated';
  createdAt: string;
}

interface VaultStats {
  totalBonds: number;
  totalDeposited: number;
  totalWithdrawn: number;
  activeBonds: number;
  averageCollateralRatio: number;
}

export default function VaultPage() {
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [stats, setStats] = useState<VaultStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDepositForm, setShowDepositForm] = useState(false);

  useEffect(() => {
    loadVaultData();
  }, []);

  const loadVaultData = async () => {
    setIsLoading(true);

    try {
      // Check if user is authenticated
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        console.log('User not authenticated, showing empty state');
        setBonds([]);
        setStats({
          totalBonds: 0,
          totalDeposited: 0,
          totalWithdrawn: 0,
          activeBonds: 0,
          averageCollateralRatio: 0,
        });
        setIsLoading(false);
        return;
      }

      // Load user's bonds and vault stats in parallel
      const [userBonds, vaultStats] = await Promise.all([
        vaultService.getMyBonds(),
        vaultService.getVaultStats()
      ]);

      setBonds(userBonds || []);
      setStats(vaultStats || {
        totalBonds: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        activeBonds: 0,
        averageCollateralRatio: 0,
      });
    } catch (error) {
      console.error('Failed to load vault data:', error);
      // Fallback to empty state
      setBonds([]);
      setStats({
        totalBonds: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        activeBonds: 0,
        averageCollateralRatio: 0,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vault Management</h1>
            <p className="mt-2 text-gray-600">
              Manage founder bonds and collateral deposits
            </p>
          </div>
          <button
            onClick={() => setShowDepositForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Deposit Bond
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total Bonds" value={stats.totalBonds.toString()} />
          <StatCard title="Total Deposited" value={`$${stats.totalDeposited.toLocaleString()}`} />
          <StatCard title="Total Withdrawn" value={`$${stats.totalWithdrawn.toLocaleString()}`} />
          <StatCard title="Active Bonds" value={stats.activeBonds.toString()} />
          <StatCard title="Avg Collateral Ratio" value={`${stats.averageCollateralRatio.toFixed(2)}x`} />
        </div>
      )}

      {/* Bonds Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Bonds</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bond ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collateral Ratio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bonds.map((bond) => (
                  <tr key={bond.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{bond.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${bond.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bond.collateralRatio.toFixed(2)}x
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={bond.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bond.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {bond.status === 'Active' && (
                        <button className="text-red-600 hover:text-red-900">
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Form Modal */}
      {showDepositForm && (
        <DepositBondModal
          onClose={() => setShowDepositForm(false)}
          onSuccess={() => {
            setShowDepositForm(false);
            loadVaultData();
          }}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

interface StatusBadgeProps {
  status: 'Active' | 'Withdrawn' | 'Liquidated';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    Active: 'bg-green-100 text-green-800',
    Withdrawn: 'bg-gray-100 text-gray-800',
    Liquidated: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

interface DepositBondModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function DepositBondModal({ onClose, onSuccess }: DepositBondModalProps) {
  const [amount, setAmount] = useState('');
  const [collateralRatio, setCollateralRatio] = useState('1.5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Deposit Bond</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bond Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="10000"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collateral Ratio
            </label>
            <input
              type="number"
              step="0.1"
              min="1.5"
              value={collateralRatio}
              onChange={(e) => setCollateralRatio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 1.5x required</p>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Depositing...' : 'Deposit Bond'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
