// Frontend API service - communicates with Supabase Edge Functions
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ExtractedClaim {
  id: string;
  type: string;
  statement: string;
  paragraph: string;
  date: string;
  confidence: number;
  legalSection?: string;
  severity: 'low' | 'medium' | 'high' | 'urgent';
}

interface PetitionAnalysis {
  summary: string;
  claims: ExtractedClaim[];
  timeline: Array<{
    date: string;
    event: string;
    type: 'incident' | 'procedural' | 'filing';
  }>;
  riskFactors: string[];
  recommendations: string[];
  overallSeverity: 'low' | 'medium' | 'high' | 'urgent';
  processingTime: number;
}

interface EvidenceEvaluation {
  relevance: number;
  clarity: number;
  completeness: number;
  specificity: number;
  timeliness: number;
  credibility: number;
  metadata: number;
  contextMatch: number;
  overallScore: number;
  rating: 'Good' | 'Moderate' | 'Bad';
  issues: string;
  recommendations: string[];
  processingTime: number;
}

class ApiService {
  private supabaseUrl: string;
  private supabaseKey: string;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!this.supabaseUrl || !this.supabaseKey) {
      console.warn('Supabase configuration missing. Please set up Supabase connection.');
    }
  }

  private async callEdgeFunction<T>(
    functionName: string,
    payload: any,
    isFormData: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) {
        return {
          success: false,
          error: 'Supabase not configured. Please connect to Supabase first.',
        };
      }

      const url = `${this.supabaseUrl}/functions/v1/${functionName}`;
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.supabaseKey}`,
      };

      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: isFormData ? payload : JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Test OpenAI connection through edge function
  async testOpenAI(): Promise<ApiResponse<any>> {
    return this.callEdgeFunction('test-openai', { test: true });
  }

  // Upload petition file
  async uploadPetition(file: File, userId: string): Promise<ApiResponse<{ petitionId: string; petitionNumber: string }>> {
    const formData = new FormData();
    formData.append('petition', file);
    formData.append('userId', userId);
    
    return this.callEdgeFunction('upload-petition', formData, true);
  }

  // Analyze petition using AI
  async analyzePetition(petitionId: string): Promise<ApiResponse<PetitionAnalysis>> {
    // First, we need to get the petition content from the database
    // For now, we'll use mock content since we don't have the full database integration
    const mockContent = `
      Petition regarding repeated physical assault and police negligence.
      
      On 12th April 2024, unknown individuals came to my house, argued with me, and beat me up severely. 
      I sustained injuries on my arms and back. The next day, 13th April 2024, they came again and 
      beat me up once more.
      
      When I tried to file a complaint at the police station on 14th April 2024, the SHO refused to 
      accept my complaint initially. After persistent requests, the SHO finally accepted my complaint 
      on 17th April 2024, but no action has been taken so far.
      
      I request immediate action against the perpetrators and investigation into the SHO's negligence.
    `;

    return this.callEdgeFunction('analyze-petition', {
      petitionId,
      content: mockContent
    });
  }

  // Evaluate evidence using AI
  async evaluateEvidence(evidenceId: string): Promise<ApiResponse<EvidenceEvaluation>> {
    // Mock evidence data for demonstration
    const mockEvidenceData = {
      evidenceId,
      description: 'Medical examination report from Government Hospital showing physical injuries including bruises on arms and back, dated 12-Apr-2024, signed by Dr. Ramesh Kumar with hospital seal.',
      evidenceType: 'Document',
      claimId: 'C1',
      petitionContext: 'Physical assault case with multiple incidents'
    };

    return this.callEdgeFunction('evaluate-evidence', mockEvidenceData);
  }

  // Generate comprehensive report
  async generateReport(
    petitionId: string,
    reportType: 'summary' | 'detailed' | 'dashboard'
  ): Promise<ApiResponse<{ reportUrl: string }>> {
    // This would call a report generation edge function
    // For now, return a mock response
    return {
      success: true,
      data: {
        reportUrl: `#report-${petitionId}-${reportType}`
      }
    };
  }

  // Check system health
  async checkSystemHealth(): Promise<ApiResponse<any>> {
    const results = await Promise.all([
      this.testOpenAI(),
      this.testSupabaseConnection()
    ]);

    return {
      success: true,
      data: {
        openai: results[0],
        supabase: results[1],
        timestamp: new Date().toISOString()
      }
    };
  }

  private async testSupabaseConnection(): Promise<ApiResponse<any>> {
    try {
      if (!this.supabaseUrl || !this.supabaseKey) {
        return {
          success: false,
          error: 'Supabase configuration missing'
        };
      }

      const response = await fetch(`${this.supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`
        }
      });

      if (response.ok) {
        return {
          success: true,
          data: { status: 'connected', url: this.supabaseUrl }
        };
      } else {
        return {
          success: false,
          error: `Connection failed: ${response.status}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection error'
      };
    }
  }
}

export const apiService = new ApiService();
export type { PetitionAnalysis, EvidenceEvaluation, ExtractedClaim };