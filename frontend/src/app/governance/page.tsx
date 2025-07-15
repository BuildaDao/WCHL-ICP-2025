'use client';

import { useState, useEffect } from 'react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: 'Active' | 'Passed' | 'Rejected' | 'Executed';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endTime: string;
  createdAt: string;
}

interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  totalVoters: number;
  yourVotingPower: number;
  participationRate: number;
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  useEffect(() => {
    loadGovernanceData();
  }, []);

  const loadGovernanceData = async () => {
    setIsLoading(true);
    // Simulate API calls - will be replaced with actual canister calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setProposals([
      {
        id: 1,
        title: 'Increase Developer Revenue Share',
        description: 'Proposal to increase developer revenue share from 60% to 65%',
        proposer: 'dev1-abc...',
        status: 'Active',
        votesFor: 150,
        votesAgainst: 45,
        totalVotes: 195,
        endTime: '2024-01-20',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        title: 'Update Collateral Requirements',
        description: 'Reduce minimum collateral ratio from 1.5x to 1.3x for founder bonds',
        proposer: 'founder1-def...',
        status: 'Passed',
        votesFor: 220,
        votesAgainst: 80,
        totalVotes: 300,
        endTime: '2024-01-10',
        createdAt: '2024-01-05'
      },
      {
        id: 3,
        title: 'Emergency Fallback Threshold',
        description: 'Set emergency fallback trigger at 80% collateral ratio',
        proposer: 'admin-ghi...',
        status: 'Rejected',
        votesFor: 90,
        votesAgainst: 210,
        totalVotes: 300,
        endTime: '2024-01-01',
        createdAt: '2023-12-25'
      }
    ]);

    setStats({
      totalProposals: 3,
      activeProposals: 1,
      passedProposals: 1,
      totalVoters: 45,
      yourVotingPower: 1250,
      participationRate: 0.65
    });

    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Governance</h1>
            <p className="mt-2 text-gray-600">
              Participate in DAO governance and vote on proposals
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Create Proposal
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard title="Total Proposals" value={stats.totalProposals.toString()} />
          <StatCard title="Active Proposals" value={stats.activeProposals.toString()} />
          <StatCard title="Passed Proposals" value={stats.passedProposals.toString()} />
          <StatCard title="Total Voters" value={stats.totalVoters.toString()} />
          <StatCard title="Your Voting Power" value={stats.yourVotingPower.toLocaleString()} />
          <StatCard title="Participation Rate" value={`${(stats.participationRate * 100).toFixed(1)}%`} />
        </div>
      )}

      {/* Proposals List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Proposals</h3>
        </div>
        
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onClick={() => setSelectedProposal(proposal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Proposal Modal */}
      {showCreateForm && (
        <CreateProposalModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadGovernanceData();
          }}
        />
      )}

      {/* Proposal Details Modal */}
      {selectedProposal && (
        <ProposalDetailsModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onVote={() => {
            setSelectedProposal(null);
            loadGovernanceData();
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

interface ProposalCardProps {
  proposal: Proposal;
  onClick: () => void;
}

function ProposalCard({ proposal, onClick }: ProposalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Passed': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Executed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const votePercentage = proposal.totalVotes > 0 
    ? (proposal.votesFor / proposal.totalVotes) * 100 
    : 0;

  return (
    <div 
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">#{proposal.id} {proposal.title}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(proposal.status)}`}>
              {proposal.status}
            </span>
          </div>
          <p className="text-gray-600 mb-3">{proposal.description}</p>
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>Proposer: {proposal.proposer}</span>
            <span>Created: {proposal.createdAt}</span>
            {proposal.status === 'Active' && <span>Ends: {proposal.endTime}</span>}
          </div>
        </div>
        <div className="ml-6 text-right">
          <div className="text-sm text-gray-500 mb-1">
            {proposal.votesFor} / {proposal.totalVotes} votes
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${votePercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {votePercentage.toFixed(1)}% approval
          </div>
        </div>
      </div>
    </div>
  );
}

interface CreateProposalModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateProposalModal({ onClose, onSuccess }: CreateProposalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create Proposal</h3>
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
              Proposal Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter proposal title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Describe your proposal in detail"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Proposal Requirements
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Minimum 1000 voting power required to create proposals</li>
                    <li>Proposals require 24 hours for voting</li>
                    <li>50% + 1 votes needed to pass</li>
                  </ul>
                </div>
              </div>
            </div>
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ProposalDetailsModalProps {
  proposal: Proposal;
  onClose: () => void;
  onVote: () => void;
}

function ProposalDetailsModal({ proposal, onClose, onVote }: ProposalDetailsModalProps) {
  const [voteChoice, setVoteChoice] = useState<'for' | 'against' | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async () => {
    if (!voteChoice) return;

    setIsVoting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVoting(false);
    onVote();
  };

  const votePercentage = proposal.totalVotes > 0
    ? (proposal.votesFor / proposal.totalVotes) * 100
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Proposal #{proposal.id}: {proposal.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
            <p className="text-gray-900">{proposal.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Proposer</h4>
              <p className="text-gray-900">{proposal.proposer}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                proposal.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                proposal.status === 'Passed' ? 'bg-green-100 text-green-800' :
                proposal.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {proposal.status}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Voting Results</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">For ({proposal.votesFor} votes)</span>
                <span className="text-sm font-medium text-green-600">{votePercentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${votePercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Against ({proposal.votesAgainst} votes)</span>
                <span className="text-sm font-medium text-red-600">{(100 - votePercentage).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {proposal.status === 'Active' && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-4">Cast Your Vote</h4>
              <div className="space-y-3">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setVoteChoice('for')}
                    className={`flex-1 p-3 border rounded-lg text-center ${
                      voteChoice === 'for'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    Vote For
                  </button>
                  <button
                    onClick={() => setVoteChoice('against')}
                    className={`flex-1 p-3 border rounded-lg text-center ${
                      voteChoice === 'against'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    Vote Against
                  </button>
                </div>

                {voteChoice && (
                  <button
                    onClick={handleVote}
                    disabled={isVoting}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isVoting ? 'Submitting Vote...' : `Submit Vote ${voteChoice === 'for' ? 'For' : 'Against'}`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
