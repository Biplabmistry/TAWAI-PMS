import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, AlertTriangle, Users, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import ConnectionStatusComponent from '../components/ConnectionStatus';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Active Petitions',
      value: '127',
      change: '+12%',
      changeType: 'increase',
      icon: FileText,
    },
    {
      name: 'Claims Processed',
      value: '1,234',
      change: '+19%',
      changeType: 'increase',
      icon: TrendingUp,
    },
    {
      name: 'High Priority Cases',
      value: '23',
      change: '-8%',
      changeType: 'decrease',
      icon: AlertTriangle,
    },
    {
      name: 'SHO Performance Avg',
      value: '3.8/5',
      change: '+0.3',
      changeType: 'increase',
      icon: Award,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New petition processed',
      case: 'P-2024/09321',
      time: '2 minutes ago',
      status: 'completed',
    },
    {
      id: 2,
      action: 'Evidence evaluation completed',
      case: 'P-2024/09318',
      time: '15 minutes ago',
      status: 'completed',
    },
    {
      id: 3,
      action: 'SHO rating updated',
      case: 'P-2024/09315',
      time: '1 hour ago',
      status: 'warning',
    },
    {
      id: 4,
      action: 'Report generated',
      case: 'P-2024/09312',
      time: '2 hours ago',
      status: 'completed',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Legal-Tech AI Assistant</h1>
        <p className="text-blue-100">
          Streamline petition processing, claims analysis, and evidence evaluation with AI-powered insights.
        </p>
      </div>

      {/* Connection Status */}
      <ConnectionStatusComponent />

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.name}
              variants={item}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/process"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Process New Petition</h4>
                  <p className="text-sm text-gray-500">Upload and analyze petition documents</p>
                </div>
              </Link>
              <Link
                to="/claims"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Analyze Claims</h4>
                  <p className="text-sm text-gray-500">Review extracted legal claims</p>
                </div>
              </Link>
              <Link
                to="/evidence"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Evaluate Evidence</h4>
                  <p className="text-sm text-gray-500">Assess evidence quality and relevance</p>
                </div>
              </Link>
              <Link
                to="/report"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Award className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">Generate Report</h4>
                  <p className="text-sm text-gray-500">Create comprehensive case reports</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 h-2 w-2 mt-2 rounded-full ${
                    activity.status === 'completed'
                      ? 'bg-green-400'
                      : activity.status === 'warning'
                      ? 'bg-yellow-400'
                      : 'bg-gray-400'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.case}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;