'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalBonds: number;
  totalRevenue: number;
  activeProposals: number;
  pendingConversions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBonds: 0,
    totalRevenue: 0,
    activeProposals: 0,
    pendingConversions: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading stats - will be replaced with actual canister calls
    const loadStats = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStats({
        totalBonds: 12,
        totalRevenue: 45000,
        activeProposals: 3,
        pendingConversions: 2,
      });
      setIsLoading(false);
    };

    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of your milestone vault system on the Internet Computer
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Bonds"
          value={stats.totalBonds.toString()}
          subtitle="Active vault bonds"
          isLoading={isLoading}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          subtitle="Distributed revenue"
          isLoading={isLoading}
          color="green"
        />
        <StatCard
          title="Active Proposals"
          value={stats.activeProposals.toString()}
          subtitle="Governance proposals"
          isLoading={isLoading}
          color="purple"
        />
        <StatCard
          title="Pending Conversions"
          value={stats.pendingConversions.toString()}
          subtitle="Fallback conversions"
          isLoading={isLoading}
          color="orange"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <QuickActionsCard />
        <RecentActivityCard />
      </div>

      {/* System Status */}
      <SystemStatusCard />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  isLoading: boolean;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, subtitle, isLoading, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {isLoading ? (
            <div className="mt-2 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <div className="w-6 h-6 bg-current rounded"></div>
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <ActionButton
          href="/vault"
          title="Deposit Bond"
          description="Create a new founder bond"
          color="blue"
        />
        <ActionButton
          href="/splitter"
          title="Distribute Revenue"
          description="Allocate revenue to recipients"
          color="green"
        />
        <ActionButton
          href="/governance"
          title="Create Proposal"
          description="Submit a governance proposal"
          color="purple"
        />
      </div>
    </div>
  );
}

function RecentActivityCard() {
  const activities = [
    { type: 'bond', message: 'New bond deposited: 10,000 ICP', time: '2 hours ago' },
    { type: 'revenue', message: 'Revenue distributed: $5,000', time: '4 hours ago' },
    { type: 'proposal', message: 'Proposal #3 passed', time: '1 day ago' },
    { type: 'conversion', message: 'Fallback conversion triggered', time: '2 days ago' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemStatusCard() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusItem name="Vault Canister" status="healthy" />
        <StatusItem name="Splitter Canister" status="healthy" />
        <StatusItem name="Fallback Canister" status="healthy" />
        <StatusItem name="Governance Canister" status="healthy" />
      </div>
    </div>
  );
}

interface ActionButtonProps {
  href: string;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple';
}

function ActionButton({ href, title, description, color }: ActionButtonProps) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
  };

  return (
    <a
      href={href}
      className={`block p-4 rounded-lg ${colorClasses[color]} text-white transition-colors`}
    >
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm opacity-90">{description}</p>
    </a>
  );
}

interface StatusItemProps {
  name: string;
  status: 'healthy' | 'warning' | 'error';
}

function StatusItem({ name, status }: StatusItemProps) {
  const statusColors = {
    healthy: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-900">{name}</span>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  );
}
