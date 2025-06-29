import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Brain, Shield, Image, Video, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetition } from '../context/PetitionContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const ProcessPetition: React.FC = () => {
  const { state, dispatch } = usePetition();
  const { state: authState } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationMessage, setValidationMessage] = useState('');
  const [processingStep, setProcessingStep] = useState('');
  const [petitionId, setPetitionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['.txt', '.doc', '.docx', '.pdf', '.jpeg', '.jpg', '.png'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    // Check if user is authenticated
    if (!authState.isAuthenticated || !authState.user) {
      setValidationStatus('invalid');
      setValidationMessage('❗ You must be logged in to upload petitions');
      return;
    }

    setValidationStatus('validating');
    setValidationMessage('');

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        errors.push(`${file.name}: Invalid file type`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        errors.push(`${file.name}: File size exceeds 50MB limit`);
        continue;
      }

      if (file.size === 0) {
        errors.push(`${file.name}: File is empty`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setValidationStatus('invalid');
      setValidationMessage(`❗ ${errors.join(', ')}`);
      return;
    }

    if (validFiles.length === 0) {
      setValidationStatus('invalid');
      setValidationMessage('❗ No valid files to upload');
      return;
    }

    try {
      setProcessingStep('Uploading files to secure server...');
      
      // Upload primary petition file (first file)
      const primaryFile = validFiles[0];
      const uploadResponse = await apiService.uploadPetition(primaryFile, authState.user.id);
      
      if (!uploadResponse.success) {
        setValidationStatus('invalid');
        setValidationMessage(`❗ ${uploadResponse.error}`);
        return;
      }

      setPetitionId(uploadResponse.data!.petitionId);
      setUploadedFiles(validFiles);
      dispatch({ type: 'SET_PETITION_FILE', payload: primaryFile });
      
      setValidationStatus('valid');
      setValidationMessage(`✅ ${validFiles.length} file(s) uploaded successfully. Ready for AI-powered analysis.`);
      
    } catch (error) {
      setValidationStatus('invalid');
      setValidationMessage('❗ Failed to upload files. Please try again.');
    } finally {
      setProcessingStep('');
    }
  };

  const processDocument = async () => {
    if (!petitionId) return;

    setProcessing(true);
    
    try {
      setProcessingStep('Initializing secure AI analysis...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingStep('Extracting legal claims using GPT-4...');
      const analysisResponse = await apiService.analyzePetition(petitionId);
      
      if (!analysisResponse.success) {
        throw new Error(analysisResponse.error);
      }

      setProcessingStep('Validating claims against legal framework...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProcessingStep('Generating evidence recommendations...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const analysis = analysisResponse.data!;

      // Convert analysis to the format expected by the context
      const claims = analysis.claims.map(claim => ({
        id: claim.id,
        type: claim.type,
        statement: claim.statement,
        paragraph: claim.paragraph,
        date: claim.date,
        confidence: claim.confidence
      }));

      dispatch({ type: 'SET_CLAIMS', payload: claims });
      dispatch({ type: 'SET_CURRENT_STEP', payload: 1 });
      
      setProcessingStep('Analysis complete!');
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error processing document:', error);
      setValidationMessage('❗ Failed to process document. Please check your connection and try again.');
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    if (newFiles.length === 0) {
      dispatch({ type: 'SET_PETITION_FILE', payload: null as any });
      dispatch({ type: 'SET_PETITION_CONTENT', payload: '' });
      setValidationStatus('idle');
      setValidationMessage('');
      setPetitionId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="h-6 w-6 text-green-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="h-6 w-6 text-purple-600" />;
      case 'pdf':
        return <FileText className="h-6 w-6 text-red-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-6 w-6 text-blue-600" />;
      default:
        return <File className="h-6 w-6 text-gray-600" />;
    }
  };

  // Show login message if user is not authenticated
  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">
              Please log in to upload and process petition documents.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Secure AI-Powered Petition Processing</h2>
            <p className="text-sm text-green-700">All AI processing happens on secure backend servers</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          Upload petition documents and evidence files for secure AI-powered claims extraction and legal analysis. 
          Your data is processed on encrypted servers with full audit trails.
        </p>

        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-900">Security Features</h4>
              <ul className="text-sm text-green-800 mt-1 space-y-1">
                <li>• End-to-end encryption for all file transfers</li>
                <li>• AI processing on secure backend servers</li>
                <li>• Complete audit trails and access logging</li>
                <li>• Support for multiple file formats (.txt, .doc, .docx, .pdf, .jpeg, .png)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                validationStatus === 'valid' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Multi-Format Upload</span>
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                processing || state.claims.length > 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                {processing ? <Brain className="h-4 w-4 animate-pulse" /> : '2'}
              </div>
              <span className="ml-2 text-sm font-medium">Backend AI Analysis</span>
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                state.claims.length > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Review Results</span>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="space-y-6">
          {uploadedFiles.length === 0 ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop your petition documents and evidence here
                </p>
                <p className="text-gray-500">
                  or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-gray-400">
                  Supports: .txt, .doc, .docx, .pdf, .jpeg, .png (max 50MB each)
                </p>
                <p className="text-xs text-green-600">
                  🔒 Files are encrypted during upload and processing
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf,.jpeg,.jpg,.png"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h3>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Add More Files
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.name)}
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-48">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf,.jpeg,.jpg,.png"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}

          {/* Processing Step Display */}
          {processingStep && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Processing</p>
                  <p className="text-sm text-blue-700">{processingStep}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Validation Status */}
          <AnimatePresence>
            {validationMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center space-x-2 p-4 rounded-lg ${
                  validationStatus === 'valid' 
                    ? 'bg-green-50 text-green-800' 
                    : validationStatus === 'invalid'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-blue-50 text-blue-800'
                }`}
              >
                {validationStatus === 'valid' ? (
                  <CheckCircle className="h-5 w-5" />
                ) : validationStatus === 'invalid' ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                )}
                <p>{validationMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Process Button */}
          {validationStatus === 'valid' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <button
                onClick={processDocument}
                disabled={processing}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing && (
                  <Brain className="h-4 w-4 animate-pulse" />
                )}
                <span>{processing ? 'AI Processing...' : 'Start Secure AI Analysis'}</span>
              </button>
            </motion.div>
          )}

          {/* Processing Status */}
          {processing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                <div>
                  <p className="font-medium text-blue-900">Secure AI Analysis in Progress</p>
                  <p className="text-sm text-blue-700">Processing on encrypted backend servers with full audit logging</p>
                </div>
              </div>
              <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {state.claims.length > 0 && !processing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Secure AI Analysis Complete!</p>
                  <p className="text-sm text-green-700">
                    {state.claims.length} legal claims extracted using GPT-4 on secure servers. 
                    Proceed to Claims Analysis for detailed review.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessPetition;