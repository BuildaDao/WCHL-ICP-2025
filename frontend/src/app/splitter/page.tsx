'use client';

import { useState, useEffect } from 'react';

interface Recipient {
  principal: string;
  percentage: number;
  role: 'Developer' | 'Founder' | 'Investor' | 'Other';
}

interface Distribution {
  id: number;
  totalAmount: number;
  timestamp: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

interface SplitterStats {
  totalDistributions: number;
  totalRevenue: number;
  totalDeveloperShare: number;
  totalFounderShare: number;
  pendingClaims: number;
}

export default function SplitterPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [stats, setStats] = useState<SplitterStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDistributeForm, setShowDistributeForm] = useState(false);
  const [showAddRecipientForm, setShowAddRecipientForm] = useState(false);

  useEffect(() => {
    loadSplitterData();
  }, []);

  const loadSplitterData = async () => {
    setIsLoading(true);
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRecipients([
      { principal: 'dev1-abc...', percentage: 30, role: 'Developer' },
      { principal: 'dev2-def...', percentage: 30, role: 'Developer' },
      { principal: 'founder1-ghi...', percentage: 25, role: 'Founder' },
      { principal: 'investor1-jkl...', percentage: 15, role: 'Investor' },
    ]);

    setDistributions([
      { id: 1, totalAmount: 10000, timestamp: '2024-01-15', status: 'Completed' },
      { id: 2, totalAmount: 7500, timestamp: '2024-01-10', status: 'Completed' },
      { id: 3, totalAmount: 5000, timestamp: '2024-01-05', status: 'Pending' },
    ]);

    setStats({
      totalDistributions: 3,
      totalRevenue: 22500,
      totalDeveloperShare: 13500,
      totalFounderShare: 5625,
      pendingClaims: 1200,
    });

    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Revenue Distribution</h1>
            <p className="mt-2 text-gray-600">
              Manage revenue allocation with developer-first distribution
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddRecipientForm(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Add Recipient
            </button>
            <button
              onClick={() => setShowDistributeForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Distribute Revenue
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard title="Total Distributions" value={stats.totalDistributions.toString()} />
          <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} />
          <StatCard title="Developer Share" value={`$${stats.totalDeveloperShare.toLocaleString()}`} />
          <StatCard title="Founder Share" value={`$${stats.totalFounderShare.toLocaleString()}`} />
          <StatCard title="Pending Claims" value={`$${stats.pendingClaims.toLocaleString()}`} />
        </div>
      )}

      {/* Recipients and Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recipients */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recipients</h3>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{recipient.principal}</p>
                    <p className="text-sm text-gray-500">{recipient.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{recipient.percentage}%</p>
                    <RoleBadge role={recipient.role} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Distributions */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Distributions</h3>
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
            <div className="p-6 space-y-4">
              {distributions.map((distribution) => (
                <div key={distribution.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Distribution #{distribution.id}</p>
                    <p className="text-sm text-gray-500">{distribution.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${distribution.totalAmount.toLocaleString()}</p>
                    <StatusBadge status={distribution.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Distribution Strategy Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Developer-First Distribution</h3>
        <p className="text-blue-800 mb-4">
          Revenue is distributed with developers receiving priority allocation (60% of total), 
          followed by proportional distribution to all recipients including founders.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Phase 1: Developer Priority</h4>
            <p className="text-sm text-gray-600">60% allocated to developers first</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900">Phase 2: Remaining Distribution</h4>
            <p className="text-sm text-gray-600">40% distributed proportionally to all recipients</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDistributeForm && (
        <DistributeRevenueModal
          onClose={() => setShowDistributeForm(false)}
          onSuccess={() => {
            setShowDistributeForm(false);
            loadSplitterData();
          }}
        />
      )}

      {showAddRecipientForm && (
        <AddRecipientModal
          onClose={() => setShowAddRecipientForm(false)}
          onSuccess={() => {
            setShowAddRecipientForm(false);
            loadSplitterData();
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

interface RoleBadgeProps {
  role: 'Developer' | 'Founder' | 'Investor' | 'Other';
}

function RoleBadge({ role }: RoleBadgeProps) {
  const roleClasses = {
    Developer: 'bg-blue-100 text-blue-800',
    Founder: 'bg-purple-100 text-purple-800',
    Investor: 'bg-green-100 text-green-800',
    Other: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleClasses[role]}`}>
      {role}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'Pending' | 'Completed' | 'Failed';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

interface DistributeRevenueModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function DistributeRevenueModal({ onClose, onSuccess }: DistributeRevenueModalProps) {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Distribute Revenue</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount ($)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="5000"
              required
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Distribution Preview</h4>
            <p className="text-sm text-gray-600">
              • 60% to developers first: ${amount ? (parseFloat(amount) * 0.6).toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-600">
              • 40% distributed proportionally: ${amount ? (parseFloat(amount) * 0.4).toLocaleString() : '0'}
            </p>
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
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Distributing...' : 'Distribute'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddRecipientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddRecipientModal({ onClose, onSuccess }: AddRecipientModalProps) {
  const [principal, setPrincipal] = useState('');
  const [percentage, setPercentage] = useState('');
  const [role, setRole] = useState<'Developer' | 'Founder' | 'Investor' | 'Other'>('Developer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Recipient</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Principal ID</label>
            <input
              type="text"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="abc123-def456..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="10"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="Developer">Developer</option>
              <option value="Founder">Founder</option>
              <option value="Investor">Investor</option>
              <option value="Other">Other</option>
            </select>
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
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Recipient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
