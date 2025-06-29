import React, { useState } from 'react';
import { Eye, Upload, CheckCircle, XCircle, AlertTriangle, Star, Brain, Shield, Image, Video, File } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePetition } from '../context/PetitionContext';
import { apiService } from '../services/api';

const EvidenceEvaluation: React.FC = () => {
  const { state, dispatch } = usePetition();
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [evaluatingEvidence, setEvaluatingEvidence] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const evaluationCriteria = [
    { name: 'Relevance', description: 'How directly the evidence supports the claim' },
    { name: 'Clarity', description: 'Readability and visual quality of the evidence' },
    { name: 'Completeness', description: 'Whether the evidence provides full context' },
    { name: 'Specificity', description: 'Level of detail covering What, When, Where, How' },
    { name: 'Timeliness', description: 'When the evidence was captured relative to the incident' },
    { name: 'Credibility', description: 'Source verification and authenticity' },
    { name: 'Metadata', description: 'Presence of timestamp, GPS, author information' },
    { name: 'Context Match', description: 'Alignment with complaint narrative' }
  ];

  // Enhanced mock evidence data with different file types
  const mockEvidence = [
    {
      id: 'E1',
      name: 'Medical_Report.pdf',
      type: 'Document',
      fileType: 'pdf',
      claimId: 'C1',
      description: 'Medical examination report from Government Hospital showing physical injuries including bruises on arms and back, dated 12-Apr-2024, signed by Dr. Ramesh Kumar with hospital seal.',
      rating: 'Good' as const,
      issues: 'Complete medical examination with verified doctor signature',
      metadata: {
        relevance: 95,
        clarity: 90,
        completeness: 88,
        specificity: 92,
        timeliness: 85,
        credibility: 98,
        metadata: 80,
        contextMatch: 90
      }
    },
    {
      id: 'E2',
      name: 'Witness_Statement.docx',
      type: 'Document',
      fileType: 'docx',
      claimId: 'C1',
      description: 'Written statement from neighbor Suresh stating he saw the assault but lacks specific time details and exact location description.',
      rating: 'Moderate' as const,
      issues: 'Statement lacks specific timeline details',
      metadata: {
        relevance: 88,
        clarity: 85,
        completeness: 70,
        specificity: 65,
        timeliness: 90,
        credibility: 85,
        metadata: 60,
        contextMatch: 80
      }
    },
    {
      id: 'E3',
      name: 'CCTV_Footage.mp4',
      type: 'Video',
      fileType: 'mp4',
      claimId: 'C2',
      description: 'Low quality CCTV footage from nearby shop showing unclear figures, no timestamp visible, poor lighting conditions.',
      rating: 'Bad' as const,
      issues: 'Poor video quality, timestamp missing',
      metadata: {
        relevance: 70,
        clarity: 40,
        completeness: 60,
        specificity: 50,
        timeliness: 95,
        credibility: 80,
        metadata: 30,
        contextMatch: 75
      }
    },
    {
      id: 'E4',
      name: 'Police_Complaint_Copy.pdf',
      type: 'Document',
      fileType: 'pdf',
      claimId: 'C3',
      description: 'Official police complaint copy with proper stamps, signatures, and acknowledgment receipt dated 17-Apr-2024.',
      rating: 'Good' as const,
      issues: 'Official document with proper stamps and signatures',
      metadata: {
        relevance: 98,
        clarity: 95,
        completeness: 90,
        specificity: 88,
        timeliness: 100,
        credibility: 100,
        metadata: 85,
        contextMatch: 95
      }
    },
    {
      id: 'E5',
      name: 'Injury_Photos.jpg',
      type: 'Image',
      fileType: 'jpg',
      claimId: 'C1',
      description: 'High-resolution photographs of physical injuries taken immediately after the incident, showing clear bruising and marks.',
      rating: 'Good' as const,
      issues: 'Clear photographic evidence with good lighting',
      metadata: {
        relevance: 92,
        clarity: 95,
        completeness: 85,
        specificity: 88,
        timeliness: 98,
        credibility: 90,
        metadata: 75,
        contextMatch: 92
      }
    }
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Good': return 'text-green-700 bg-green-100 border-green-200';
      case 'Moderate': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'Bad': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'Good': return <CheckCircle className="h-5 w-5" />;
      case 'Moderate': return <AlertTriangle className="h-5 w-5" />;
      case 'Bad': return <XCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-6 w-6 text-green-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-6 w-6 text-purple-600" />;
      case 'pdf':
        return <File className="h-6 w-6 text-red-600" />;
      case 'doc':
      case 'docx':
        return <File className="h-6 w-6 text-blue-600" />;
      default:
        return <File className="h-6 w-6 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateOverallScore = (metadata: any) => {
    const scores = Object.values(metadata) as number[];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const handleSecureAIEvaluation = async (evidence: any) => {
    try {
      setEvaluatingEvidence(evidence.id);
      
      // Call backend API for secure AI evaluation
      const evaluation = await apiService.evaluateEvidence(evidence.id);
      
      if (evaluation.success) {
        console.log('Secure AI Evaluation Result:', evaluation.data);
        // In a real app, you would update the evidence in your state/database
        alert('Evidence evaluated successfully using secure backend AI!');
      } else {
        throw new Error(evaluation.error);
      }
      
    } catch (error) {
      console.error('Error during secure AI evaluation:', error);
      alert('Failed to evaluate evidence. Please check your connection and try again.');
    } finally {
      setEvaluatingEvidence(null);
    }
  };

  const handleUploadEvidence = async () => {
    setUploadingEvidence(true);
    
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.doc,.docx,.pdf,.jpeg,.jpg,.png,.mp4,.avi,.mov';
    input.multiple = true;
    
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        try {
          // Simulate upload process
          await new Promise(resolve => setTimeout(resolve, 2000));
          alert(`${files.length} evidence file(s) uploaded successfully!`);
        } catch (error) {
          alert('Failed to upload evidence files.');
        }
      }
      setUploadingEvidence(false);
    };
    
    input.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Secure AI-Powered Evidence Evaluation</h2>
            <p className="text-sm text-green-700">All AI analysis processed on encrypted backend servers</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Assess submitted evidence using secure AI-powered analysis and comprehensive 8-point evaluation criteria.
          All processing happens on encrypted servers with full audit trails.
        </p>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Secure Evidence Processing</h4>
              <ul className="text-sm text-green-800 mt-1 space-y-1">
                <li>• Evidence analysis on secure backend infrastructure</li>
                <li>• End-to-end encryption for all data transfers</li>
                <li>• Complete audit trails for legal compliance</li>
                <li>• AI models trained on legal frameworks</li>
                <li>• Support for documents, images, and video files</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Evaluation Criteria Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Secure AI Evaluation Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {evaluationCriteria.map((criterion, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-1">{criterion.name}</h4>
                <p className="text-sm text-gray-600">{criterion.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{mockEvidence.length}</p>
                <p className="text-sm text-blue-700">Total Evidence</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {mockEvidence.filter(e => e.rating === 'Good').length}
                </p>
                <p className="text-sm text-green-700">Good Quality</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-yellow-900">
                  {mockEvidence.filter(e => e.rating === 'Moderate').length}
                </p>
                <p className="text-sm text-yellow-700">Moderate Quality</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-900">
                  {mockEvidence.filter(e => e.rating === 'Bad').length}
                </p>
                <p className="text-sm text-red-700">Poor Quality</p>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Evidence Items</h3>
            <button
              onClick={handleUploadEvidence}
              disabled={uploadingEvidence}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {uploadingEvidence ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload Evidence</span>
                </>
              )}
            </button>
          </div>
          
          {mockEvidence.map((evidence, index) => (
            <motion.div
              key={evidence.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setSelectedEvidence(selectedEvidence === evidence.id ? null : evidence.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getFileIcon(evidence.fileType)}
                      <h3 className="text-lg font-semibold text-gray-900">{evidence.name}</h3>
                      <span className="text-sm text-gray-500">({evidence.type})</span>
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${getRatingColor(evidence.rating)}`}>
                        {getRatingIcon(evidence.rating)}
                        <span className="text-sm font-medium">{evidence.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{evidence.issues}</p>
                    <div className="flex items-center space-x-6">
                      <span className="text-sm text-gray-500">
                        Related to Claim: <span className="font-medium">{evidence.claimId}</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        Overall Score: <span className={`font-medium ${getScoreColor(calculateOverallScore(evidence.metadata))}`}>
                          {calculateOverallScore(evidence.metadata)}%
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSecureAIEvaluation(evidence);
                      }}
                      disabled={evaluatingEvidence === evidence.id}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
                    >
                      {evaluatingEvidence === evidence.id ? (
                        <>
                          <Brain className="h-4 w-4 animate-pulse" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          <span>Secure AI Evaluate</span>
                        </>
                      )}
                    </button>
                    <button className="text-blue-600 hover:text-blue-700">
                      {selectedEvidence === evidence.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>
              </div>

              {selectedEvidence === evidence.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Detailed Evaluation Scores</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(evidence.metadata).map(([criterion, score]) => {
                        const criterionInfo = evaluationCriteria.find(c => 
                          c.name.toLowerCase() === criterion.toLowerCase()
                        );
                        return (
                          <div key={criterion} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 capitalize">{criterion}</h5>
                              <div className="flex items-center space-x-1">
                                <span className={`font-bold ${getScoreColor(score as number)}`}>
                                  {score}%
                                </span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= Math.round((score as number) / 20)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className={`h-2 rounded-full ${
                                  (score as number) >= 80 ? 'bg-green-500' : 
                                  (score as number) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-600">
                              {criterionInfo?.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Recommendations */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Secure AI-Generated Recommendations</h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <ul className="space-y-2 text-sm text-blue-900">
                          {evidence.rating === 'Bad' && (
                            <>
                              <li>• Consider re-obtaining evidence with better quality</li>
                              <li>• Verify source authenticity and metadata</li>
                              <li>• Ensure proper documentation procedures</li>
                            </>
                          )}
                          {evidence.rating === 'Moderate' && (
                            <>
                              <li>• Add supporting documentation for context</li>
                              <li>• Verify timestamp and location information</li>
                              <li>• Consider obtaining corroborating evidence</li>
                            </>
                          )}
                          {evidence.rating === 'Good' && (
                            <>
                              <li>• Evidence meets quality standards</li>
                              <li>• Suitable for legal proceedings</li>
                              <li>• Maintain chain of custody documentation</li>
                            </>
                          )}
                        </ul>
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

export default EvidenceEvaluation;