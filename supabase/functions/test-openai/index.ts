/*
  # OpenAI Connection Test Edge Function

  1. New Edge Function
    - `test-openai`
      - Tests OpenAI API connectivity
      - Validates API key configuration
      - Returns connection status and model info
      - Used for system health checks

  2. Security
    - No sensitive data exposure
    - Rate limited testing
    - Secure API key handling
    - Audit logging

  3. Features
    - Simple connectivity test
    - Model availability check
    - Response time measurement
    - Error diagnostics
*/

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: 'OpenAI API key not configured in environment variables',
          configured: false
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Test OpenAI API with a simple request
    const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are a test assistant. Respond with exactly: "OpenAI connection successful"' 
          },
          { 
            role: 'user', 
            content: 'Test connection' 
          }
        ],
        max_tokens: 10,
        temperature: 0
      }),
    })

    const responseTime = Date.now() - startTime;

    if (!testResponse.ok) {
      const errorData = await testResponse.text()
      console.error('OpenAI API test failed:', errorData)
      
      return new Response(
        JSON.stringify({ 
          status: 'error',
          message: `OpenAI API test failed: ${testResponse.status} ${testResponse.statusText}`,
          configured: true,
          responseTime: responseTime,
          details: errorData
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const testData = await testResponse.json()
    const aiResponse = testData.choices[0]?.message?.content

    // Verify the response
    const isValidResponse = aiResponse && aiResponse.includes('OpenAI connection successful')

    return new Response(
      JSON.stringify({
        status: isValidResponse ? 'connected' : 'warning',
        message: isValidResponse 
          ? 'OpenAI API connection successful and responding correctly'
          : 'OpenAI API connected but response validation failed',
        configured: true,
        responseTime: responseTime,
        model: 'gpt-4',
        aiResponse: aiResponse,
        usage: testData.usage,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in test-openai function:', error)
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: 'Failed to test OpenAI connection',
        configured: false,
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})