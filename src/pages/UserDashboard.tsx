import React, { useState } from 'react';
import { User, FileText, Clock, CheckCircle, AlertTriangle, Upload, Eye, Calendar, Badge, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { usePetition } from '../context/PetitionContext';

const UserDashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: petitionState } = usePetition();
  const [activeTab, setActiveTab] = useState<'overview' | 'petitions' | 'evidence' | 'profile'>('overview');

  // Mock data for demonstration
  const mockPetitions = [
    {
      id: 'P-2024/09321',
      title: 'Physical Assault and Police Negligence',
      status: 'under_investigation',
      priority: 'high',
      createdAt: '2024-04-18',
      claimsCount: 4,
      evidenceCount: 3,
      lastUpdated: '2024-04-20'
    },
    {
      id: 'P-2024/09318',
      title: 'Property Dispute Resolution',
      status: 'completed',
      priority: 'medium',
      createdAt: '2024-04-15',
      claimsCount: 2,
      evidenceCount: 5,
      lastUpdated: '2024-04-19'
    },
    {
      id: 'P-2024/09315',
      title: 'Harassment Complaint',
      status: 'pending',
      priority: 'urgent',
      createdAt: '2024-04-12',
      claimsCount: 3,
      evidenceCount: 2,
      lastUpdated: '2024-04-18'
    }
  ];

  const mockEvidence = [
    {
      id: 'E1',
      name: 'Medical Report.pdf',
      type: 'Document',
      petitionId: 'P-2024/09321',
      quality: 'Good',
      uploadedAt: '2024-04-18',
      size: '2.3 MB'
    },
    {
      id: 'E2',
      name: 'Witness Statement.docx',
      type: 'Document',
      petitionId: 'P-2024/09321',
      quality: 'Moderate',
      uploadedAt: '2024-04-18',
      size: '1.1 MB'
    },
    {
      id: 'E3',
      name: 'CCTV_Footage.mp4',
      type: 'Video',
      petitionId: 'P-2024/09318',
      quality: 'Bad',
      uploadedAt: '2024-04-15',
      size: '45.2 MB'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'under_investigation': return 'text-blue-700 bg-blue-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 bg-red-100';
      case 'high': return 'text-orange-700 bg-orange-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-green-700 bg-green-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Good': return 'text-green-700 bg-green-100';
      case 'Moderate': return 'text-yellow-700 bg-yellow-100';
      case 'Bad': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'petitions', name: 'My Petitions', icon: FileText },
    { id: 'evidence', name: 'Evidence History', icon: Upload },
    { id: 'profile', name: 'Profile', icon: Badge }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {authState.user?.fullName}</h1>
            <p className="text-gray-600">{authState.user?.designation} • Badge: {authState.user?.badgeNumber}</p>
            <p className="text-sm text-gray-500">{authState.user?.department}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{mockPetitions.length}</p>
                      <p className="text-sm text-blue-700">Total Petitions</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-green-900">
                        {mockPetitions.filter(p => p.status === 'completed').length}
                      </p>
                      <p className="text-sm text-green-700">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-yellow-900">
                        {mockPetitions.filter(p => p.status === 'under_investigation').length}
                      </p>
                      <p className="text-sm text-yellow-700">In Progress</p>
                    </div>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-2xl font-bold text-red-900">
                        {mockPetitions.filter(p => p.priority === 'urgent').length}
                      </p>
                      <p className="text-sm text-red-700">Urgent</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {mockPetitions.slice(0, 3).map((petition) => (
                    <div key={petition.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{petition.title}</p>
                          <p className="text-sm text-gray-500">Petition {petition.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(petition.status)}`}>
                          {petition.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">{petition.lastUpdated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Petitions Tab */}
          {activeTab === 'petitions' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">My Petitions</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  New Petition
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Petition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claims</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockPetitions.map((petition) => (
                      <tr key={petition.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{petition.id}</div>
                            <div className="text-sm text-gray-500">{petition.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(petition.status)}`}>
                            {petition.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(petition.priority)}`}>
                            {petition.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {petition.claimsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {petition.evidenceCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {petition.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-3">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Evidence History</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Upload Evidence
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockEvidence.map((evidence) => (
                  <div key={evidence.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Upload className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{evidence.name}</h4>
                          <p className="text-sm text-gray-500">{evidence.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(evidence.quality)}`}>
                        {evidence.quality}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Petition:</span>
                        <span className="font-medium">{evidence.petitionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{evidence.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uploaded:</span>
                        <span>{evidence.uploadedAt}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors">
                        View
                      </button>
                      <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-50 transition-colors">
                        Re-analyze
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={authState.user?.fullName || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={authState.user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge Number</label>
                    <input
                      type="text"
                      value={authState.user?.badgeNumber || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      value={authState.user?.role || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Station ID</label>
                    <input
                      type="text"
                      value={authState.user?.stationId || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={authState.user?.department || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Member since: {new Date(authState.user?.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                  {authState.user?.lastLogin && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Last login: {new Date(authState.user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;