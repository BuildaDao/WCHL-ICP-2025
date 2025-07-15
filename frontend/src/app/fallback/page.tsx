'use client';

import { useState, useEffect } from 'react';

interface Conversion {
  id: number;
  bondId: number;
  originalAmount: number;
  convertedAmount: number;
  conversionRate: number;
  status: 'Pending' | 'Completed' | 'Failed';
  triggeredAt: string;
  completedAt?: string;
}

interface EmergencyAction {
  id: number;
  type: 'Pause' | 'Resume' | 'Emergency_Conversion' | 'Rate_Update';
  description: string;
  triggeredBy: string;
  timestamp: string;
  status: 'Active' | 'Completed';
}

interface FallbackStats {
  totalConversions: number;
  totalConverted: number;
  pendingConversions: number;
  emergencyThreshold: number;
  currentCollateralRatio: number;
  systemStatus: 'Normal' | 'Warning' | 'Emergency';
}

export default function FallbackPage() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [emergencyActions, setEmergencyActions] = useState<EmergencyAction[]>([]);
  const [stats, setStats] = useState<FallbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  useEffect(() => {
    loadFallbackData();
  }, []);

  const loadFallbackData = async () => {
    setIsLoading(true);
    // Simulate API calls - will be replaced with actual canister calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setConversions([
      {
        id: 1,
        bondId: 3,
        originalAmount: 15000,
        convertedAmount: 12000,
        conversionRate: 0.8,
        status: 'Completed',
        triggeredAt: '2024-01-15',
        completedAt: '2024-01-15'
      },
      {
        id: 2,
        bondId: 7,
        originalAmount: 8000,
        convertedAmount: 6400,
        conversionRate: 0.8,
        status: 'Pending',
        triggeredAt: '2024-01-16'
      }
    ]);

    setEmergencyActions([
      {
        id: 1,
        type: 'Emergency_Conversion',
        description: 'Triggered emergency conversion for bond #3 due to low collateral ratio',
        triggeredBy: 'system-auto',
        timestamp: '2024-01-15',
        status: 'Completed'
      },
      {
        id: 2,
        type: 'Rate_Update',
        description: 'Updated emergency conversion rate to 0.8',
        triggeredBy: 'admin-abc...',
        timestamp: '2024-01-14',
        status: 'Completed'
      }
    ]);

    setStats({
      totalConversions: 2,
      totalConverted: 18400,
      pendingConversions: 1,
      emergencyThreshold: 1.2,
      currentCollateralRatio: 1.45,
      systemStatus: 'Normal'
    });

    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fallback System</h1>
            <p className="mt-2 text-gray-600">
              Emergency conversion and system protection mechanisms
            </p>
          </div>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Emergency Actions
          </button>
        </div>
      </div>

      {/* System Status Alert */}
      {stats && (
        <div className={`mb-8 p-4 rounded-lg border ${
          stats.systemStatus === 'Emergency' ? 'bg-red-50 border-red-200' :
          stats.systemStatus === 'Warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${
              stats.systemStatus === 'Emergency' ? 'bg-red-500' :
              stats.systemStatus === 'Warning' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></div>
            <div>
              <h3 className={`font-medium ${
                stats.systemStatus === 'Emergency' ? 'text-red-800' :
                stats.systemStatus === 'Warning' ? 'text-yellow-800' :
                'text-green-800'
              }`}>
                System Status: {stats.systemStatus}
              </h3>
              <p className={`text-sm ${
                stats.systemStatus === 'Emergency' ? 'text-red-700' :
                stats.systemStatus === 'Warning' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                Current collateral ratio: {stats.currentCollateralRatio.toFixed(2)}x 
                (Emergency threshold: {stats.emergencyThreshold.toFixed(2)}x)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <StatCard title="Total Conversions" value={stats.totalConversions.toString()} />
          <StatCard title="Total Converted" value={`$${stats.totalConverted.toLocaleString()}`} />
          <StatCard title="Pending Conversions" value={stats.pendingConversions.toString()} />
          <StatCard title="Emergency Threshold" value={`${stats.emergencyThreshold.toFixed(2)}x`} />
          <StatCard title="Current Ratio" value={`${stats.currentCollateralRatio.toFixed(2)}x`} />
          <StatCard 
            title="System Status" 
            value={stats.systemStatus}
            color={
              stats.systemStatus === 'Emergency' ? 'red' :
              stats.systemStatus === 'Warning' ? 'yellow' : 'green'
            }
          />
        </div>
      )}

      {/* Conversions and Emergency Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Conversions</h3>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversions.map((conversion) => (
                <ConversionCard key={conversion.id} conversion={conversion} />
              ))}
            </div>
          )}
        </div>

        {/* Emergency Actions */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Emergency Actions</h3>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {emergencyActions.map((action) => (
                <EmergencyActionCard key={action.id} action={action} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Emergency Actions Modal */}
      {showEmergencyModal && (
        <EmergencyActionsModal
          onClose={() => setShowEmergencyModal(false)}
          onAction={() => {
            setShowEmergencyModal(false);
            loadFallbackData();
          }}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  color?: 'red' | 'yellow' | 'green';
}

function StatCard({ title, value, color }: StatCardProps) {
  const colorClasses = color ? {
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700'
  }[color] : 'text-gray-900';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${colorClasses}`}>{value}</p>
    </div>
  );
}

interface ConversionCardProps {
  conversion: Conversion;
}

function ConversionCard({ conversion }: ConversionCardProps) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">
              Conversion #{conversion.id}
            </h4>
            <StatusBadge status={conversion.status} />
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Bond ID: #{conversion.bondId}</p>
            <p>Original: ${conversion.originalAmount.toLocaleString()}</p>
            <p>Converted: ${conversion.convertedAmount.toLocaleString()}</p>
            <p>Rate: {(conversion.conversionRate * 100).toFixed(0)}%</p>
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>Triggered: {conversion.triggeredAt}</p>
          {conversion.completedAt && <p>Completed: {conversion.completedAt}</p>}
        </div>
      </div>
    </div>
  );
}

interface EmergencyActionCardProps {
  action: EmergencyAction;
}

function EmergencyActionCard({ action }: EmergencyActionCardProps) {
  const getActionColor = (type: string) => {
    switch (type) {
      case 'Pause': return 'bg-yellow-100 text-yellow-800';
      case 'Resume': return 'bg-green-100 text-green-800';
      case 'Emergency_Conversion': return 'bg-red-100 text-red-800';
      case 'Rate_Update': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(action.type)}`}>
              {action.type.replace('_', ' ')}
            </span>
            <StatusBadge status={action.status} />
          </div>
          <p className="text-gray-900 mb-2">{action.description}</p>
          <div className="text-sm text-gray-600">
            <p>Triggered by: {action.triggeredBy}</p>
            <p>Timestamp: {action.timestamp}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: 'Pending' | 'Completed' | 'Failed' | 'Active';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusClasses = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Failed: 'bg-red-100 text-red-800',
    Active: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

interface EmergencyActionsModalProps {
  onClose: () => void;
  onAction: () => void;
}

function EmergencyActionsModal({ onClose, onAction }: EmergencyActionsModalProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const emergencyActions = [
    {
      id: 'pause_system',
      title: 'Pause System',
      description: 'Temporarily halt all vault operations',
      severity: 'high',
      confirmText: 'PAUSE'
    },
    {
      id: 'emergency_convert',
      title: 'Emergency Conversion',
      description: 'Trigger immediate conversion of all at-risk bonds',
      severity: 'critical',
      confirmText: 'CONVERT'
    },
    {
      id: 'update_threshold',
      title: 'Update Emergency Threshold',
      description: 'Modify the emergency conversion threshold',
      severity: 'medium',
      confirmText: 'UPDATE'
    }
  ];

  const handleExecute = async () => {
    if (!selectedAction || confirmationText !== getConfirmText()) return;

    setIsExecuting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsExecuting(false);
    onAction();
  };

  const getConfirmText = () => {
    const action = emergencyActions.find(a => a.id === selectedAction);
    return action?.confirmText || '';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Emergency Actions</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Warning: Emergency Actions
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>These actions can significantly impact the system. Use with extreme caution.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select Action</h4>
            <div className="space-y-3">
              {emergencyActions.map((action) => (
                <div
                  key={action.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAction === action.id
                      ? getSeverityColor(action.severity)
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedAction(action.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">{action.title}</h5>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        action.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        action.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {action.severity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedAction && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Confirmation Required
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                Type <strong>{getConfirmText()}</strong> to confirm this action:
              </p>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder={getConfirmText()}
              />
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExecute}
              disabled={!selectedAction || confirmationText !== getConfirmText() || isExecuting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isExecuting ? 'Executing...' : 'Execute Action'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
