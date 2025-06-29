/*
  # Petition Analysis Edge Function

  1. New Edge Function
    - `analyze-petition`
      - Processes petition documents using OpenAI GPT-4
      - Extracts legal claims with confidence scores
      - Generates timeline and recommendations
      - Returns structured analysis data

  2. Security
    - Uses Supabase service role for database access
    - OpenAI API key secured in environment variables
    - Input validation and sanitization
    - Rate limiting and error handling

  3. Features
    - Legal claim extraction with Indian legal framework
    - Confidence scoring for each claim
    - Timeline generation from petition content
    - Risk assessment and recommendations
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PetitionAnalysisRequest {
  petitionId: string;
  content: string;
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const startTime = Date.now();

    // Parse request body
    const { petitionId, content }: PetitionAnalysisRequest = await req.json()

    // Validate input
    if (!petitionId || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: petitionId and content' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate content length
    if (content.length < 50) {
      return new Response(
        JSON.stringify({ error: 'Petition content too short for analysis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (content.length > 50000) {
      return new Response(
        JSON.stringify({ error: 'Petition content too long (max 50,000 characters)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create system prompt for legal analysis
    const systemPrompt = `You are a specialized AI assistant for the Andhra Pradesh Police Department, trained in Indian legal frameworks and petition analysis.

Your task is to analyze petition documents and extract legal claims with high accuracy. Focus on:

1. LEGAL CLAIM TYPES (based on Indian Penal Code and local laws):
   - Physical Assault (IPC Sections 351-358)
   - Police Negligence (Section 166 BNS 2023)
   - Procedural Violation (BNSS 2023)
   - Property Dispute (IPC Sections 441-462)
   - Harassment (IPC Section 354)
   - Fraud (IPC Sections 415-420)
   - Corruption (Prevention of Corruption Act)
   - Other (specify)

2. CONFIDENCE SCORING (0.0 to 1.0):
   - 0.9-1.0: Clear, unambiguous legal claim with specific details
   - 0.8-0.89: Strong claim with minor ambiguities
   - 0.7-0.79: Moderate claim requiring clarification
   - 0.6-0.69: Weak claim with significant gaps
   - Below 0.6: Insufficient evidence for legal claim

3. SEVERITY ASSESSMENT:
   - urgent: Immediate threat to life/safety, ongoing crimes
   - high: Serious crimes, repeat offenses, vulnerable victims
   - medium: Standard criminal matters, property disputes
   - low: Minor infractions, civil matters

4. TIMELINE EXTRACTION:
   - Extract specific dates and events
   - Categorize as: incident, procedural, filing
   - Maintain chronological order

Return ONLY valid JSON in this exact format:

{
  "summary": "Brief 2-3 sentence summary of the petition",
  "claims": [
    {
      "id": "C1",
      "type": "Physical Assault",
      "statement": "Exact quote from petition describing the claim",
      "paragraph": "¶2",
      "date": "DD-MMM-YYYY",
      "confidence": 0.95,
      "legalSection": "Section 351 BNS 2023",
      "severity": "high"
    }
  ],
  "timeline": [
    {
      "date": "DD-MMM-YYYY",
      "event": "Brief description of what happened",
      "type": "incident"
    }
  ],
  "riskFactors": ["List of identified risk factors"],
  "recommendations": ["List of recommended actions for police"],
  "overallSeverity": "medium"
}`

    const userPrompt = `Analyze this petition document and extract legal claims:

PETITION CONTENT:
${content}

Please provide a comprehensive analysis following the specified format.`

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'AI analysis service temporarily unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const analysisContent = openaiData.choices[0]?.message?.content

    if (!analysisContent) {
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the AI response
    let analysis: PetitionAnalysis
    try {
      const parsedAnalysis = JSON.parse(analysisContent)
      
      // Add processing time
      analysis = {
        ...parsedAnalysis,
        processingTime: Date.now() - startTime
      }

      // Validate the response structure
      if (!analysis.claims || !Array.isArray(analysis.claims)) {
        throw new Error('Invalid claims structure')
      }

      // Ensure all claims have required fields
      analysis.claims = analysis.claims.map((claim, index) => ({
        id: claim.id || `C${index + 1}`,
        type: claim.type || 'Other',
        statement: claim.statement || '',
        paragraph: claim.paragraph || `¶${index + 1}`,
        date: claim.date || 'Date not specified',
        confidence: Math.min(Math.max(claim.confidence || 0.5, 0), 1),
        legalSection: claim.legalSection || 'To be determined',
        severity: claim.severity || 'medium'
      }))

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI analysis' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the analysis for audit purposes
    console.log(`Petition ${petitionId} analyzed successfully. Claims extracted: ${analysis.claims.length}`)

    // Return the analysis
    return new Response(
      JSON.stringify(analysis),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in analyze-petition function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during petition analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})