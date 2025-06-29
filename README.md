Legal-Tech AI Assistant - Comprehensive Technical Documentation
System Architecture Overview
High-Level Architecture

┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│  Supabase Edge   │────│   OpenAI API    │
│   (Frontend)    │    │   Functions      │    │   (GPT-4)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Supabase Auth  │    │  PostgreSQL DB   │    │  Supabase       │
│  & Storage      │    │  with RLS        │    │  Storage        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
Frontend Architecture
Technology Stack
React 18.3.1 - Modern React with concurrent features
TypeScript 5.5.3 - Type safety and enhanced developer experience
Vite 5.4.2 - Fast build tool and development server
Tailwind CSS 3.4.1 - Utility-first CSS framework
Framer Motion 11.5.4 - Animation library for smooth transitions
React Router DOM 6.26.1 - Client-side routing
Lucide React 0.344.0 - Icon library
Component Architecture

src/
├── components/
│   ├── Layout.tsx              # Main application layout
│   ├── AuthGuard.tsx           # Authentication wrapper
│   ├── LoginForm.tsx           # Authentication interface
│   └── ConnectionStatus.tsx    # System health monitoring
├── pages/
│   ├── Dashboard.tsx           # Main dashboard
│   ├── UserDashboard.tsx       # User-specific dashboard
│   ├── ProcessPetition.tsx     # Document upload & processing
│   ├── ClaimsAnalysis.tsx      # Legal claims review
│   ├── EvidenceEvaluation.tsx  # Evidence quality assessment
│   └── ReportGeneration.tsx    # Report creation
├── context/
│   ├── AuthContext.tsx         # Authentication state management
│   └── PetitionContext.tsx     # Petition data management
├── services/
│   └── api.ts                  # API service layer
└── utils/
    └── connectionTest.ts       # System connectivity testing
State Management
React Context API for global state management
useReducer hooks for complex state logic
Local Storage for session persistence
Real-time updates through Supabase subscriptions
Authentication Flow

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'SHO' | 'IO' | 'SP' | 'Admin';
  badgeNumber: string;
  stationId?: string;
  department: string;
  designation?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}
Backend Architecture
Supabase Edge Functions
Four serverless functions handle AI processing:

1. upload-petition

// Handles secure file uploads and text extraction
POST /functions/v1/upload-petition
Content-Type: multipart/form-data

Request:
- petition: File (PDF, DOCX, TXT, JPEG, PNG)
- userId: string
- description?: string

Response:
{
  petitionId: string,
  petitionNumber: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  contentPreview: string,
  message: string
}
2. analyze-petition

// AI-powered legal claims extraction
POST /functions/v1/analyze-petition
Content-Type: application/json

Request:
{
  petitionId: string,
  content: string
}

Response: PetitionAnalysis {
  summary: string,
  claims: ExtractedClaim[],
  timeline: TimelineEvent[],
  riskFactors: string[],
  recommendations: string[],
  overallSeverity: 'low' | 'medium' | 'high' | 'urgent',
  processingTime: number
}
3. evaluate-evidence

// Evidence quality assessment
POST /functions/v1/evaluate-evidence
Content-Type: application/json

Request:
{
  evidenceId: string,
  description: string,
  evidenceType: string,
  claimId: string,
  petitionContext?: string
}

Response: EvidenceEvaluation {
  relevance: number,      // 0-100
  clarity: number,        // 0-100
  completeness: number,   // 0-100
  specificity: number,    // 0-100
  timeliness: number,     // 0-100
  credibility: number,    // 0-100
  metadata: number,       // 0-100
  contextMatch: number,   // 0-100
  overallScore: number,
  rating: 'Good' | 'Moderate' | 'Bad',
  issues: string,
  recommendations: string[],
  processingTime: number
}
4. test-openai

// System health check for OpenAI connectivity
POST /functions/v1/test-openai
Content-Type: application/json

Response:
{
  status: 'connected' | 'error' | 'warning',
  message: string,
  configured: boolean,
  responseTime: number,
  model: string,
  timestamp: string
}
Database Schema
Core Tables Structure

-- Users table with role-based access
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'SHO' CHECK (role IN ('SHO', 'IO', 'SP', 'Admin')),
  full_name text NOT NULL,
  badge_number text UNIQUE NOT NULL,
  station_id text,
  phone_number text,
  department text DEFAULT 'Andhra Pradesh Police',
  designation text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Petitions table - central data repository
CREATE TABLE petitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  petitioner_name text NOT NULL,
  petitioner_contact text NOT NULL,
  petitioner_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'under_investigation', 'review_needed', 'closed', 
                     'claims_extracted', 'actions_assigned', 'evidence_submitted', 'report_generated')),
  priority text NOT NULL DEFAULT 'medium' 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES users(id),
  created_by uuid NOT NULL REFERENCES users(id),
  station_id text,
  ai_summary text,
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  quality_score numeric(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
  overall_rating text CHECK (overall_rating IN ('excellent', 'good', 'satisfactory', 'needs_improvement', 'poor')),
  fir_required boolean DEFAULT false,
  fir_number text,
  fir_justification text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  file_attachments jsonb DEFAULT '[]'::jsonb
);

-- Claims table - extracted legal claims
CREATE TABLE claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  claim_number integer NOT NULL,
  claim_text text NOT NULL,
  claim_type text NOT NULL DEFAULT 'other' 
    CHECK (claim_type IN ('property_dispute', 'harassment', 'fraud', 'theft', 'assault', 'corruption', 'other')),
  legal_sections text[] DEFAULT '{}',
  confidence_score numeric(3,2) NOT NULL DEFAULT 0.5 
    CHECK (confidence_score >= 0 AND confidence_score <= 1),
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'verified', 'rejected', 'under_investigation', 'resolved')),
  priority text NOT NULL DEFAULT 'medium' 
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  extracted_by_ai boolean DEFAULT true,
  edited_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(petition_id, claim_number)
);

-- Evidence table - file and quality management
CREATE TABLE evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid NOT NULL REFERENCES petitions(id) ON DELETE CASCADE,
  claim_id uuid REFERENCES claims(id) ON DELETE CASCADE,
  action_id uuid REFERENCES actions(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  evidence_type text NOT NULL DEFAULT 'other' 
    CHECK (evidence_type IN ('document', 'photograph', 'audio', 'video', 'witness_statement', 'expert_report', 'other')),
  relevance_score numeric(3,2) DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  quality_score numeric(3,2) DEFAULT 0.5 CHECK (quality_score >= 0 AND quality_score <= 1),
  ai_analysis text,
  has_signature boolean,
  is_authentic boolean DEFAULT true,
  logical_consistency_score numeric(3,2) CHECK (logical_consistency_score >= 0 AND logical_consistency_score <= 1),
  uploaded_by uuid NOT NULL REFERENCES users(id),
  verified_by uuid REFERENCES users(id),
  verification_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
Row Level Security (RLS) Policies

-- Example RLS policy for petitions
CREATE POLICY "Users can read petitions in their station or assigned to them"
ON petitions FOR SELECT TO authenticated
USING (
  created_by = auth.uid() OR 
  assigned_to = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role IN ('Admin', 'SP')
  ) OR 
  EXISTS (
    SELECT 1 FROM users u1, users u2 
    WHERE u1.id = auth.uid() 
    AND u2.id = petitions.created_by 
    AND u1.station_id = u2.station_id
  )
);
Storage Architecture

-- Supabase Storage bucket configuration
Bucket: petition-files
- Public: false
- File size limit: 50MB
- Allowed MIME types: 
  * application/pdf
  * application/vnd.openxmlformats-officedocument.wordprocessingml.document
  * text/plain
  * image/jpeg
  * image/png

-- Storage policies for file access control
Policy: "Users can read accessible petition files"
Target: authenticated
Operations: SELECT
Definition: bucket_id = 'petition-files' AND check_petition_file_access(name)
AI Integration Architecture
OpenAI GPT-4 Integration

// System prompt for legal analysis
const systemPrompt = `You are a specialized AI assistant for the Andhra Pradesh Police Department, 
trained in Indian legal frameworks and petition analysis.

LEGAL CLAIM TYPES (based on Indian Penal Code):
- Physical Assault (IPC Sections 351-358)
- Police Negligence (Section 166 BNS 2023)
- Procedural Violation (BNSS 2023)
- Property Dispute (IPC Sections 441-462)
- Harassment (IPC Section 354)
- Fraud (IPC Sections 415-420)
- Corruption (Prevention of Corruption Act)

CONFIDENCE SCORING (0.0 to 1.0):
- 0.9-1.0: Clear, unambiguous legal claim
- 0.8-0.89: Strong claim with minor ambiguities
- 0.7-0.79: Moderate claim requiring clarification
- 0.6-0.69: Weak claim with significant gaps
- Below 0.6: Insufficient evidence for legal claim`;
Evidence Evaluation Criteria

interface EvaluationCriteria {
  relevance: number;      // How directly evidence supports the claim
  clarity: number;        // Readability and visual quality
  completeness: number;   // Whether evidence provides full context
  specificity: number;    // Level of detail (What, When, Where, How)
  timeliness: number;     // When evidence was captured vs incident
  credibility: number;    // Source verification and authenticity
  metadata: number;       // Timestamp, GPS, author information
  contextMatch: number;   // Alignment with complaint narrative
}
AI Processing Pipeline

1. Document Upload → Text Extraction → Content Validation
2. AI Analysis Request → GPT-4 Processing → Response Validation
3. Claims Extraction → Confidence Scoring → Legal Mapping
4. Evidence Evaluation → Quality Assessment → Recommendations
5. Report Generation → Data Aggregation → PDF Creation
Security Implementation
Authentication & Authorization

// JWT token structure
interface JWTPayload {
  sub: string;           // User ID
  email: string;
  role: string;
  station_id?: string;
  iat: number;           // Issued at
  exp: number;           // Expiration
}

// Role-based access control
const permissions = {
  IO: ['read_own_petitions', 'create_petitions', 'update_evidence'],
  SHO: ['read_station_petitions', 'assign_cases', 'approve_reports'],
  SP: ['read_all_petitions', 'generate_analytics', 'quality_assessment'],
  Admin: ['full_access', 'user_management', 'system_config']
};
Data Encryption
In Transit: TLS 1.3 encryption for all API communications
At Rest: AES-256 encryption for database and file storage
API Keys: Stored in Supabase environment variables, never exposed to frontend
Session Management: Secure JWT tokens with configurable expiration
Audit Logging

-- AI analysis logs for audit compliance
CREATE TABLE ai_analysis_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  petition_id uuid REFERENCES petitions(id) ON DELETE CASCADE,
  analysis_type text NOT NULL CHECK (analysis_type IN 
    ('claim_extraction', 'action_planning', 'evidence_analysis', 'ocr_processing', 'quality_assessment')),
  input_data jsonb,
  ai_response jsonb,
  confidence_score numeric(5,2) CHECK (confidence_score >= 0 AND confidence_score <= 100),
  processed_by uuid NOT NULL REFERENCES users(id),
  processing_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
Performance Optimization
Database Optimization

-- Strategic indexes for performance
CREATE INDEX idx_petitions_status ON petitions(status);
CREATE INDEX idx_petitions_priority ON petitions(priority);
CREATE INDEX idx_petitions_assigned_to ON petitions(assigned_to);
CREATE INDEX idx_petitions_created_by ON petitions(created_by);
CREATE INDEX idx_petitions_station_id ON petitions(station_id);
CREATE INDEX idx_claims_petition_id ON claims(petition_id);
CREATE INDEX idx_evidence_petition_id ON evidence(petition_id);
Frontend Performance
Code Splitting: Route-based lazy loading
Memoization: React.memo for expensive components
Virtual Scrolling: For large data lists
Image Optimization: Lazy loading and compression
Bundle Optimization: Tree shaking and minification
Caching Strategy

// API response caching
const cacheConfig = {
  petitions: { ttl: 300 },      // 5 minutes
  claims: { ttl: 600 },         // 10 minutes
  evidence: { ttl: 900 },       // 15 minutes
  reports: { ttl: 1800 }        // 30 minutes
};
Error Handling & Monitoring
Error Handling Architecture

// Centralized error handling
interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId: string;
}

// Error boundary for React components
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Application Error:', error, errorInfo);
  }
}
Monitoring & Logging
Application Performance Monitoring (APM) through Supabase
Real-time error tracking with stack traces
Performance metrics for API response times
User activity logging for audit compliance
System health checks with automated alerts
Deployment Architecture
Production Environment

# Deployment configuration
Environment: Production
Platform: Supabase Cloud
Database: PostgreSQL 15+ with RLS
Storage: Supabase Storage with CDN
Functions: Deno runtime on Edge
SSL: Automatic HTTPS with Let's Encrypt
Backup: Automated daily backups with 30-day retention
CI/CD Pipeline

# GitHub Actions workflow
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Supabase
        run: supabase deploy
API Documentation
REST API Endpoints

// Authentication endpoints
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/user

// Petition management
GET    /api/petitions
POST   /api/petitions
GET    /api/petitions/:id
PUT    /api/petitions/:id
DELETE /api/petitions/:id

// Claims management
GET    /api/petitions/:id/claims
POST   /api/petitions/:id/claims
PUT    /api/claims/:id
DELETE /api/claims/:id

// Evidence management
GET    /api/petitions/:id/evidence
POST   /api/petitions/:id/evidence
PUT    /api/evidence/:id
DELETE /api/evidence/:id

// Reports
GET    /api/reports
POST   /api/reports/generate
GET    /api/reports/:id
WebSocket Events

// Real-time updates
interface WebSocketEvents {
  'petition:created': PetitionCreatedEvent;
  'petition:updated': PetitionUpdatedEvent;
  'claim:extracted': ClaimExtractedEvent;
  'evidence:evaluated': EvidenceEvaluatedEvent;
  'report:generated': ReportGeneratedEvent;
}
Testing Strategy
Unit Testing

// Jest configuration for React components
describe('ProcessPetition Component', () => {
  test('should upload file successfully', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    render(<ProcessPetition />);
    
    const uploadArea = screen.getByText(/drop your petition documents/i);
    fireEvent.drop(uploadArea, { dataTransfer: { files: [mockFile] } });
    
    await waitFor(() => {
      expect(screen.getByText(/file uploaded successfully/i)).toBeInTheDocument();
    });
  });
});
Integration Testing

// API integration tests
describe('Petition API', () => {
  test('should create petition with valid data', async () => {
    const petitionData = {
      title: 'Test Petition',
      description: 'Test Description',
      petitioner_name: 'John Doe'
    };
    
    const response = await apiService.createPetition(petitionData);
    expect(response.success).toBe(true);
    expect(response.data.id).toBeDefined();
  });
});
End-to-End Testing

// Playwright E2E tests
test('complete petition processing workflow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@police.gov.in');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await page.goto('/process');
  await page.setInputFiles('input[type="file"]', 'test-petition.pdf');
  await page.click('text=Start Secure AI Analysis');
  
  await page.waitForSelector('text=Analysis complete!');
  await expect(page.locator('text=legal claims extracted')).toBeVisible();
});
Scalability Considerations
Horizontal Scaling
Serverless Functions: Auto-scaling based on demand
Database Connections: Connection pooling with PgBouncer
File Storage: CDN distribution for global access
Load Balancing: Automatic traffic distribution
Vertical Scaling
Database Performance: Query optimization and indexing
Memory Management: Efficient data structures and caching
CPU Optimization: Asynchronous processing for AI operations
Storage Optimization: File compression and archival policies
Future Scaling Plans

// Microservices architecture for scale
interface ServiceArchitecture {
  authService: 'User authentication and authorization';
  petitionService: 'Petition management and processing';
  aiService: 'AI analysis and processing';
  evidenceService: 'Evidence management and evaluation';
  reportService: 'Report generation and analytics';
  notificationService: 'Real-time notifications and alerts';
}
This comprehensive technical documentation provides a complete overview of the Legal-Tech AI Assistant's architecture, implementation details, and operational considerations. The system is designed for scalability, security, and maintainability while providing powerful AI-driven capabilities for law enforcement operations.
