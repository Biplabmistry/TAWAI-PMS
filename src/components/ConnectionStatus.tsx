import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Server, Database, Brain, Zap } from 'lucide-react';
import { connectionVerifier, ConnectionStatus } from '../utils/connectionTest';

const ConnectionStatusComponent: React.FC = () => {
  const [connections, setConnections] = useState<ConnectionStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnections = async () => {
    setIsChecking(true);
    try {
      const results = await connectionVerifier.verifyAllConnections();
      setConnections(results);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking connections:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnections();
  }, []);

  const getStatusIcon = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ConnectionStatus['status']) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200';
      case 'disconnected':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Supabase':
        return <Database className="h-6 w-6 text-green-600" />;
      case 'Edge Functions':
        return <Zap className="h-6 w-6 text-blue-600" />;
      case 'OpenAI API':
        return <Brain className="h-6 w-6 text-purple-600" />;
      default:
        return <Server className="h-6 w-6 text-gray-600" />;
    }
  };

  const allConnected = connections.every(c => c.status === 'connected');
  const hasErrors = connections.some(c => c.status === 'error');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
          {allConnected && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">All Systems Operational</span>
            </div>
          )}
          {hasErrors && (
            <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 rounded-full">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Setup Required</span>
            </div>
          )}
        </div>
        <button
          onClick={checkConnections}
          disabled={isChecking}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Checking...' : 'Refresh'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {connections.map((connection, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getStatusColor(connection.status)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {getServiceIcon(connection.service)}
                <div>
                  <h4 className="font-medium text-gray-900">{connection.service}</h4>
                  <p className="text-sm text-gray-600">{connection.message}</p>
                </div>
              </div>
              {getStatusIcon(connection.status)}
            </div>

            {connection.details && (
              <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Details:</h5>
                <div className="text-xs text-gray-600 space-y-1">
                  {typeof connection.details === 'object' ? (
                    Object.entries(connection.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="font-medium">{key}:</span>
                        <span>{typeof value === 'boolean' ? (value ? '✓' : '✗') : String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <pre className="overflow-x-auto">{JSON.stringify(connection.details, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {lastChecked && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">🚀 Setup Status</h4>
        <div className="text-sm text-blue-800 space-y-2">
          <div className="flex items-center space-x-2">
            <span className={connections.find(c => c.service === 'Supabase')?.status === 'connected' ? '✅' : '⚠️'}>
              {connections.find(c => c.service === 'Supabase')?.status === 'connected' ? '✅' : '⚠️'}
            </span>
            <span><strong>Supabase Database:</strong> {connections.find(c => c.service === 'Supabase')?.status === 'connected' ? 'Connected' : 'Click "Connect to Supabase" button in top right'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={connections.find(c => c.service === 'Edge Functions')?.status === 'connected' ? '✅' : '⚠️'}>
              {connections.find(c => c.service === 'Edge Functions')?.status === 'connected' ? '✅' : '⚠️'}
            </span>
            <span><strong>Edge Functions:</strong> {connections.find(c => c.service === 'Edge Functions')?.status === 'connected' ? 'Deployed and Active' : 'Automatically deployed with Supabase'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={connections.find(c => c.service === 'OpenAI API')?.status === 'connected' ? '✅' : '⚠️'}>
              {connections.find(c => c.service === 'OpenAI API')?.status === 'connected' ? '✅' : '⚠️'}
            </span>
            <span><strong>OpenAI API:</strong> {connections.find(c => c.service === 'OpenAI API')?.status === 'connected' ? 'Configured in edge functions' : 'Add API key to Supabase environment variables'}</span>
          </div>
        </div>
        
        {allConnected && (
          <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">🎉 All systems ready! Your AI-powered legal assistant is fully operational.</span>
            </div>
            <ul className="mt-2 text-sm text-green-700 space-y-1">
              <li>• AI processing happens on secure backend servers</li>
              <li>• End-to-end encryption for all data transfers</li>
              <li>• Complete audit trails for legal compliance</li>
              <li>• Real-time analysis with GPT-4 integration</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusComponent;