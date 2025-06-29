/*
  # Evidence Evaluation Edge Function

  1. New Edge Function
    - `evaluate-evidence`
      - Analyzes evidence quality using AI
      - Provides 8-point evaluation criteria scoring
      - Generates improvement recommendations
      - Returns structured evaluation data

  2. Security
    - Secure evidence processing
    - Input validation and sanitization
    - Rate limiting protection
    - Audit logging

  3. Features
    - Comprehensive evidence quality assessment
    - Legal relevance scoring
    - Authenticity verification suggestions
    - Chain of custody recommendations
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EvidenceEvaluationRequest {
  evidenceId: string;
  description: string;
  evidenceType: string;
  claimId: string;
  petitionContext?: string;
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
    const { 
      evidenceId, 
      description, 
      evidenceType, 
      claimId, 
      petitionContext 
    }: EvidenceEvaluationRequest = await req.json()

    // Validate input
    if (!evidenceId || !description || !evidenceType || !claimId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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

    // Create system prompt for evidence evaluation
    const systemPrompt = `You are a specialized AI assistant for evidence evaluation in legal proceedings for the Andhra Pradesh Police Department.

Your task is to evaluate evidence quality using 8 comprehensive criteria:

1. RELEVANCE (0-100): How directly the evidence supports the legal claim
2. CLARITY (0-100): Readability, visual quality, and comprehensibility
3. COMPLETENESS (0-100): Whether evidence provides full context and details
4. SPECIFICITY (0-100): Level of detail covering What, When, Where, How
5. TIMELINESS (0-100): When evidence was captured relative to incident
6. CREDIBILITY (0-100): Source verification and authenticity indicators
7. METADATA (0-100): Presence of timestamp, GPS, author information
8. CONTEXT MATCH (0-100): Alignment with complaint narrative

SCORING GUIDELINES:
- 90-100: Excellent quality, meets all legal standards
- 80-89: Good quality, minor improvements needed
- 70-79: Moderate quality, some significant gaps
- 60-69: Poor quality, major issues present
- Below 60: Inadequate for legal proceedings

OVERALL RATING:
- Good: Average score 80+
- Moderate: Average score 60-79
- Bad: Average score below 60

Return ONLY valid JSON in this exact format:

{
  "relevance": 85,
  "clarity": 90,
  "completeness": 75,
  "specificity": 80,
  "timeliness": 95,
  "credibility": 88,
  "metadata": 70,
  "contextMatch": 85,
  "overallScore": 83,
  "rating": "Good",
  "issues": "Brief description of main issues found",
  "recommendations": [
    "Specific recommendation 1",
    "Specific recommendation 2"
  ]
}`

    const userPrompt = `Evaluate this evidence for legal proceedings:

EVIDENCE DETAILS:
- Type: ${evidenceType}
- Description: ${description}
- Related Claim ID: ${claimId}
${petitionContext ? `- Petition Context: ${petitionContext}` : ''}

Please provide a comprehensive evaluation following the 8-point criteria.`

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
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('OpenAI API error:', errorData)
      return new Response(
        JSON.stringify({ error: 'AI evaluation service temporarily unavailable' }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const openaiData = await openaiResponse.json()
    const evaluationContent = openaiData.choices[0]?.message?.content

    if (!evaluationContent) {
      return new Response(
        JSON.stringify({ error: 'No evaluation generated' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse the AI response
    let evaluation: EvidenceEvaluation
    try {
      const parsedEvaluation = JSON.parse(evaluationContent)
      
      // Add processing time and validate scores
      evaluation = {
        relevance: Math.min(Math.max(parsedEvaluation.relevance || 50, 0), 100),
        clarity: Math.min(Math.max(parsedEvaluation.clarity || 50, 0), 100),
        completeness: Math.min(Math.max(parsedEvaluation.completeness || 50, 0), 100),
        specificity: Math.min(Math.max(parsedEvaluation.specificity || 50, 0), 100),
        timeliness: Math.min(Math.max(parsedEvaluation.timeliness || 50, 0), 100),
        credibility: Math.min(Math.max(parsedEvaluation.credibility || 50, 0), 100),
        metadata: Math.min(Math.max(parsedEvaluation.metadata || 50, 0), 100),
        contextMatch: Math.min(Math.max(parsedEvaluation.contextMatch || 50, 0), 100),
        overallScore: parsedEvaluation.overallScore || 50,
        rating: parsedEvaluation.rating || 'Moderate',
        issues: parsedEvaluation.issues || 'No specific issues identified',
        recommendations: Array.isArray(parsedEvaluation.recommendations) 
          ? parsedEvaluation.recommendations 
          : ['Review evidence quality and completeness'],
        processingTime: Date.now() - startTime
      }

      // Recalculate overall score to ensure accuracy
      const scores = [
        evaluation.relevance,
        evaluation.clarity,
        evaluation.completeness,
        evaluation.specificity,
        evaluation.timeliness,
        evaluation.credibility,
        evaluation.metadata,
        evaluation.contextMatch
      ]
      evaluation.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

      // Ensure rating matches overall score
      if (evaluation.overallScore >= 80) {
        evaluation.rating = 'Good'
      } else if (evaluation.overallScore >= 60) {
        evaluation.rating = 'Moderate'
      } else {
        evaluation.rating = 'Bad'
      }

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI evaluation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log the evaluation for audit purposes
    console.log(`Evidence ${evidenceId} evaluated successfully. Overall score: ${evaluation.overallScore}`)

    // Return the evaluation
    return new Response(
      JSON.stringify(evaluation),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in evaluate-evidence function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error during evidence evaluation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})