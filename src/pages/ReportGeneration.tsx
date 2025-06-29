import React, { useState } from 'react';
import { FileOutput, Download, Eye, Star, Calendar, User, MapPin, Badge, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePetition } from '../context/PetitionContext';

const ReportGeneration: React.FC = () => {
  const { state } = usePetition();
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'dashboard' | 'io_report'>('io_report');
  const [isGenerating, setIsGenerating] = useState(false);

  const mockReportData = {
    caseNumber: 'P-2024/09321',
    petitionerName: 'Rajesh Kumar',
    accused: 'Unknown individuals & SHO Station House',
    policeStation: 'Visakhapatnam Central',
    shoName: 'Inspector Ramesh Babu',
    incidentDates: ['12-Apr-2024', '13-Apr-2024', '14-Apr-2024', '17-Apr-2024'],
    petitionDate: '18-Apr-2024',
    totalClaims: 4,
    highConfidenceClaims: 3,
    evidenceItems: 5,
    averageEvidenceQuality: 78,
    shoPerformanceScore: 2.25,
    overallQualityScore: 85,
    riskFactors: [
      'FIR not filed despite valid assault claim',
      'Delay in accepting complaint by SHO',
      'Missing witness statements within 7 days'
    ],
    recommendations: [
      'Initiate internal inquiry on SHO for negligence',
      'Send counseling and legal aid referral to petitioner',
      'Auto-escalate petition to DCP due to repeated inaction',
      'Trigger alert for zero-FIR enforcement'
    ],
    nextActions: [
      'File FIR under Section 351 BNS 2023 for physical assault',
      'Collect additional witness statements from neighbors',
      'Obtain medical records from treating physician',
      'Issue notice to accused parties for questioning',
      'Conduct site inspection and evidence collection'
    ]
  };

  const generateReport = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStarRating = (score: number) => {
    const stars = Math.round(score / 20);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const timelineEvents = [
    { date: '12-Apr', event: 'First assault reported', type: 'incident' },
    { date: '13-Apr', event: 'Second assault reported', type: 'incident' },
    { date: '14-Apr', event: 'Complaint attempted, rejected by SHO', type: 'procedural' },
    { date: '17-Apr', event: 'Complaint accepted but no action taken', type: 'procedural' },
    { date: '18-Apr', event: 'Petition filed', type: 'filing' }
  ];

  const getEventColor = (type: string) => {
    switch (type) {
      case 'incident': return 'bg-red-100 text-red-800';
      case 'procedural': return 'bg-yellow-100 text-yellow-800';
      case 'filing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create IO Report</h2>
        <p className="text-gray-600 mb-6">
          Generate comprehensive Investigating Officer reports with AI-powered insights and evidence analysis.
        </p>

        {/* Report Type Selection */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'io_report', name: 'IO Report', desc: 'Comprehensive investigation report with next actions' },
            { id: 'summary', name: 'Executive Summary', desc: 'Key findings and recommendations' },
            { id: 'detailed', name: 'Detailed Report', desc: 'Complete analysis with evidence' },
            { id: 'dashboard', name: 'SP Dashboard', desc: 'Performance metrics and insights' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setReportType(type.id as any)}
              className={`flex-1 p-4 rounded-lg border-2 text-left transition-all ${
                reportType === type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">{type.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{type.desc}</p>
            </button>
          ))}
        </div>

        {/* Case Snapshot */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Snapshot</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Badge className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Petition No.</p>
                <p className="font-medium">{mockReportData.caseNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Petitioner</p>
                <p className="font-medium">{mockReportData.petitionerName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Police Station</p>
                <p className="font-medium">{mockReportData.policeStation}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">SHO Assigned</p>
                <p className="font-medium">{mockReportData.shoName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Incident Period</p>
                <p className="font-medium">12-Apr to 17-Apr 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Petition Date</p>
                <p className="font-medium">{mockReportData.petitionDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Content Based on Type */}
        {reportType === 'io_report' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* IO Report Header */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-blue-900">Investigating Officer Report</h3>
                  <p className="text-blue-700">Case No: {mockReportData.caseNumber} | Generated: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Petition Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Petition Summary</h3>
              <p className="text-gray-700 leading-relaxed">
                The petitioner reports repeated physical assaults by unknown individuals, involving arguments and beatings on multiple occasions. He also alleges inaction and delay by the local SHO, who initially refused to accept the complaint and later failed to act even after acceptance. The incidents span several days and suggest both criminal behavior and procedural negligence. The complaint reflects a pattern of intimidation and official apathy.
              </p>
            </div>

            {/* Extracted Claims */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Legal Claims</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-gray-900">C1: Physical Assault</h4>
                  <p className="text-sm text-gray-600">"People came, argued, beat him up" - Confidence: 95%</p>
                  <p className="text-xs text-gray-500">Legal Section: Section 351 BNS 2023</p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium text-gray-900">C2: Repeated Assault</h4>
                  <p className="text-sm text-gray-600">"They came again and beat him up" - Confidence: 92%</p>
                  <p className="text-xs text-gray-500">Legal Section: Section 351 BNS 2023</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-gray-900">C3: Police Negligence</h4>
                  <p className="text-sm text-gray-600">"SHO didn't accept complaint initially" - Confidence: 88%</p>
                  <p className="text-xs text-gray-500">Legal Section: Section 166 BNS 2023</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium text-gray-900">C4: Procedural Violation</h4>
                  <p className="text-sm text-gray-600">"SHO accepted complaint after 3 days, no action" - Confidence: 90%</p>
                  <p className="text-xs text-gray-500">Legal Section: Section 173 BNSS 2023</p>
                </div>
              </div>
            </div>

            {/* Evidence Quality Assessment */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Evidence Quality Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Medical Report.pdf</span>
                    <span className="text-green-700 font-bold">Good (88%)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Police Complaint Copy.pdf</span>
                    <span className="text-green-700 font-bold">Good (95%)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="font-medium">Injury Photos.jpg</span>
                    <span className="text-green-700 font-bold">Good (90%)</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span className="font-medium">Witness Statement.docx</span>
                    <span className="text-yellow-700 font-bold">Moderate (75%)</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                    <span className="font-medium">CCTV Footage.mp4</span>
                    <span className="text-red-700 font-bold">Poor (58%)</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Overall Evidence Quality:</strong> {mockReportData.averageEvidenceQuality}% - 
                  Sufficient for proceeding with investigation and legal action.
                </p>
              </div>
            </div>

            {/* Next Actions Required */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Actions</h3>
              <div className="space-y-3">
                {mockReportData.nextActions.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-blue-900">{action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* IO Recommendations */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investigating Officer Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-900 mb-3">Immediate Actions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2 text-sm text-red-800">
                      <span className="text-red-600 mt-1">•</span>
                      <span>File FIR immediately under assault charges</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-red-800">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Issue notice to accused for questioning</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-red-800">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Conduct site inspection within 48 hours</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Follow-up Actions</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2 text-sm text-blue-800">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Collect additional witness statements</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-blue-800">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Obtain better quality CCTV footage</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-blue-800">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>Review SHO conduct for disciplinary action</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {reportType === 'summary' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Petition Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Petition Summary</h3>
              <p className="text-gray-700 leading-relaxed">
                The petitioner reports repeated physical assaults by unknown individuals, involving arguments and beatings on multiple occasions. He also alleges inaction and delay by the local SHO, who initially refused to accept the complaint and later failed to act even after acceptance. The incidents span several days and suggest both criminal behavior and procedural negligence. The complaint reflects a pattern of intimidation and official apathy.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-blue-900">{mockReportData.totalClaims}</p>
                <p className="text-sm text-blue-700">Total Claims</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-900">{mockReportData.evidenceItems}</p>
                <p className="text-sm text-green-700">Evidence Items</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className={`text-2xl font-bold ${getScoreColor(mockReportData.averageEvidenceQuality)}`}>
                  {mockReportData.averageEvidenceQuality}%
                </p>
                <p className="text-sm text-yellow-700">Evidence Quality</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center space-x-1">
                  {getStarRating(mockReportData.shoPerformanceScore * 20)}
                </div>
                <p className="text-sm text-red-700">SHO Performance</p>
              </div>
            </div>
          </motion.div>
        )}

        {reportType === 'detailed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline of Events</h3>
              <div className="space-y-4">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-16 text-right">
                      <span className="text-sm font-medium text-gray-900">{event.date}</span>
                    </div>
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-900">{event.event}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getEventColor(event.type)}`}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Claims Overview */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Claims Overview</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statement</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paragraph</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Related Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr><td className="px-6 py-4 text-sm text-gray-900">C1</td><td className="px-6 py-4 text-sm text-gray-900">People came, argued, beat him up</td><td className="px-6 py-4 text-sm text-gray-900">¶2</td><td className="px-6 py-4 text-sm text-gray-900">12-Apr</td></tr>
                    <tr><td className="px-6 py-4 text-sm text-gray-900">C2</td><td className="px-6 py-4 text-sm text-gray-900">They came again and beat him up</td><td className="px-6 py-4 text-sm text-gray-900">¶3</td><td className="px-6 py-4 text-sm text-gray-900">13-Apr</td></tr>
                    <tr><td className="px-6 py-4 text-sm text-gray-900">C3</td><td className="px-6 py-4 text-sm text-gray-900">SHO didn't accept complaint initially</td><td className="px-6 py-4 text-sm text-gray-900">¶5</td><td className="px-6 py-4 text-sm text-gray-900">14-Apr</td></tr>
                    <tr><td className="px-6 py-4 text-sm text-gray-900">C4</td><td className="px-6 py-4 text-sm text-gray-900">SHO accepted complaint after 3 days, no action</td><td className="px-6 py-4 text-sm text-gray-900">¶6</td><td className="px-6 py-4 text-sm text-gray-900">17-Apr</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {reportType === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">Claims Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Claims</span>
                    <span className="font-medium">{mockReportData.totalClaims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">High Confidence</span>
                    <span className="font-medium">{mockReportData.highConfidenceClaims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Confidence</span>
                    <span className="font-medium">92%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">Evidence Quality</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <span className="font-medium">{mockReportData.evidenceItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg. Quality</span>
                    <span className={`font-medium ${getScoreColor(mockReportData.averageEvidenceQuality)}`}>
                      {mockReportData.averageEvidenceQuality}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Chain of Custody</span>
                    <span className="font-medium text-green-600">85%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">SHO Performance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overall Rating</span>
                    <div className="flex items-center">
                      {getStarRating(mockReportData.shoPerformanceScore * 20)}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Timeliness</span>
                    <span className="font-medium text-red-600">Poor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completeness</span>
                    <span className="font-medium text-yellow-600">Fair</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-2">System Score</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Overall Quality</span>
                    <span className={`font-medium ${getScoreColor(mockReportData.overallQualityScore)}`}>
                      {mockReportData.overallQualityScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AI Confidence</span>
                    <span className="font-medium text-green-600">96%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <span className="font-medium text-yellow-600">Medium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factors & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h4 className="font-semibold text-red-900 mb-3">Risk Factors</h4>
                <ul className="space-y-2">
                  {mockReportData.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-red-800">
                      <span className="text-red-600 mt-1">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-blue-900 mb-3">SP Recommendations</h4>
                <ul className="space-y-2">
                  {mockReportData.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generate Report Button */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Report will be generated in PDF format with all selected sections
          </div>
          <div className="flex space-x-4">
            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <FileOutput className="h-4 w-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
            </button>
            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration;