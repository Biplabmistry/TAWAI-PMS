import React, { useState } from 'react';
import { Scale, FileText, Calendar, Target, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePetition } from '../context/PetitionContext';

const ClaimsAnalysis: React.FC = () => {
  const { state } = usePetition();
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  const legalFrameworks = {
    'Physical Assault': {
      section: 'Section 351 - Assault',
      act: 'Bharatiya Nyaya Sanhita, 2023',
      definition: 'Whoever makes any gesture, or any preparation intending or knowing it to be likely that such gesture or preparation will cause any person to apprehend that he is about to use unlawful violence against that person.',
      punishment: 'Imprisonment for 3 months or fine up to ₹1,000 or both'
    },
    'Police Negligence': {
      section: 'Section 166 - Public servant disobeying law',
      act: 'Bharatiya Nyaya Sanhita, 2023',
      definition: 'Whoever, being a public servant, knowingly disobeys any direction of the law as to the way in which he is to conduct himself as such public servant.',
      punishment: 'Simple imprisonment for 1 year or fine or both'
    },
    'Procedural Violation': {
      section: 'Section 173 - Police report',
      act: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
      definition: 'Every investigation shall be completed without unnecessary delay and proper procedures must be followed.',
      punishment: 'Departmental action and possible prosecution'
    }
  };

  const evidenceRecommendations = {
    'Physical Assault': [
      { item: 'Medical Report', reason: 'To document physical injuries and medical examination findings' },
      { item: 'Witness Statements', reason: 'To corroborate the assault incident with eyewitness accounts' },
      { item: 'CCTV Footage', reason: 'To provide visual evidence of the assault incident' },
      { item: 'Police Complaint Copy', reason: 'To establish timeline and official record of reporting' }
    ],
    'Police Negligence': [
      { item: 'Application Diary Entry', reason: 'To prove initial complaint submission and acknowledgment' },
      { item: 'Station Diary Extract', reason: 'To verify police station records and actions taken' },
      { item: 'Witness Statements', reason: 'To confirm negligent behavior by police officials' },
      { item: 'Communication Records', reason: 'To document follow-up attempts and responses' }
    ],
    'Procedural Violation': [
      { item: 'FIR Copy', reason: 'To verify proper FIR registration procedures were followed' },
      { item: 'Timeline Documentation', reason: 'To establish delays in procedural compliance' },
      { item: 'Legal Notices', reason: 'To document formal complaints about procedural violations' },
      { item: 'Departmental Orders', reason: 'To reference standard operating procedures' }
    ]
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.8) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.8) return 'Medium Confidence';
    return 'Low Confidence';
  };

  if (state.claims.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Scale className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Claims to Analyze</h3>
          <p className="text-gray-500 mb-6">
            Please process a petition document first to extract legal claims.
          </p>
          <a
            href="/process"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Process Petition
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Claims Analysis</h2>
        <p className="text-gray-600 mb-6">
          Review extracted legal claims and their recommended evidence requirements.
        </p>

        {/* Claims Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{state.claims.length}</p>
                <p className="text-sm text-blue-700">Total Claims</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {state.claims.filter(c => c.confidence >= 0.8).length}
                </p>
                <p className="text-sm text-green-700">High Confidence</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {new Set(state.claims.map(c => c.type)).size}
                </p>
                <p className="text-sm text-yellow-700">Claim Types</p>
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-6">
          {state.claims.map((claim, index) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedClaim(selectedClaim === claim.id ? null : claim.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{claim.id}: {claim.type}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(claim.confidence)}`}>
                        {getConfidenceText(claim.confidence)} ({Math.round(claim.confidence * 100)}%)
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">"{claim.statement}"</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        {claim.paragraph}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {claim.date}
                      </span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    {selectedClaim === claim.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>
              </div>

              {selectedClaim === claim.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-6 space-y-6">
                    {/* Legal Framework */}
                    {legalFrameworks[claim.type as keyof typeof legalFrameworks] && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Scale className="h-5 w-5 mr-2" />
                          Legal Framework
                        </h4>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {legalFrameworks[claim.type as keyof typeof legalFrameworks].section}
                              </p>
                              <p className="text-sm text-gray-600">
                                {legalFrameworks[claim.type as keyof typeof legalFrameworks].act}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Punishment</p>
                              <p className="text-sm text-gray-600">
                                {legalFrameworks[claim.type as keyof typeof legalFrameworks].punishment}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="font-medium text-gray-900 mb-2">Definition</p>
                            <p className="text-sm text-gray-700">
                              {legalFrameworks[claim.type as keyof typeof legalFrameworks].definition}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Evidence Recommendations */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Recommended Evidence
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {evidenceRecommendations[claim.type as keyof typeof evidenceRecommendations]?.map((evidence, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start">
                              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900">{evidence.item}</p>
                                <p className="text-sm text-gray-600 mt-1">{evidence.reason}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClaimsAnalysis;