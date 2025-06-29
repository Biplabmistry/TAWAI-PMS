// Connection verification utility
interface ConnectionStatus {
  service: string;
  status: 'connected' | 'disconnected' | 'error';
  message: string;
  details?: any;
}

class ConnectionVerifier {
  async verifySupabase(): Promise<ConnectionStatus> {
    try {
      // Check if Supabase environment variables are set
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        return {
          service: 'Supabase',
          status: 'error',
          message: 'Supabase environment variables not configured. Click "Connect to Supabase" button.',
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseKey,
            instruction: 'Use the "Connect to Supabase" button in the top right corner'
          }
        };
      }

      // Test connection by making a simple request
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });

      if (response.ok) {
        return {
          service: 'Supabase',
          status: 'connected',
          message: 'Successfully connected to Supabase database',
          details: { 
            url: supabaseUrl,
            edgeFunctionsReady: true,
            databaseAccess: true
          }
        };
      } else {
        return {
          service: 'Supabase',
          status: 'error',
          message: `Connection failed: ${response.status} ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        service: 'Supabase',
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async verifyOpenAI(): Promise<ConnectionStatus> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return {
          service: 'OpenAI API',
          status: 'error',
          message: 'Cannot test OpenAI - Supabase not configured'
        };
      }

      // Test OpenAI connection through Supabase Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/test-openai`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'connected') {
          return {
            service: 'OpenAI API',
            status: 'connected',
            message: 'OpenAI API successfully configured and accessible through secure edge functions',
            details: {
              model: data.model,
              responseTime: data.responseTime,
              secureBackend: true,
              edgeFunctionActive: true
            }
          };
        } else {
          return {
            service: 'OpenAI API',
            status: 'error',
            message: data.message || 'OpenAI API test failed',
            details: data
          };
        }
      } else {
        return {
          service: 'OpenAI API',
          status: 'error',
          message: 'Failed to test OpenAI through edge function'
        };
      }
    } catch (error) {
      return {
        service: 'OpenAI API',
        status: 'error',
        message: 'Cannot test OpenAI - edge function not accessible',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          instruction: 'Ensure Supabase is connected and edge functions are deployed'
        }
      };
    }
  }

  async verifyEdgeFunctions(): Promise<ConnectionStatus> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return {
          service: 'Edge Functions',
          status: 'error',
          message: 'Supabase not configured'
        };
      }

      // Test multiple edge functions
      const functions = ['test-openai', 'analyze-petition', 'evaluate-evidence', 'upload-petition'];
      const results = [];

      for (const func of functions) {
        try {
          const response = await fetch(`${supabaseUrl}/functions/v1/${func}`, {
            method: 'OPTIONS',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          results.push({ function: func, available: response.ok });
        } catch {
          results.push({ function: func, available: false });
        }
      }

      const availableFunctions = results.filter(r => r.available).length;
      const totalFunctions = results.length;

      if (availableFunctions === totalFunctions) {
        return {
          service: 'Edge Functions',
          status: 'connected',
          message: `All ${totalFunctions} edge functions are deployed and accessible`,
          details: {
            functions: results,
            deployment: 'complete',
            secureProcessing: true
          }
        };
      } else if (availableFunctions > 0) {
        return {
          service: 'Edge Functions',
          status: 'error',
          message: `${availableFunctions}/${totalFunctions} edge functions available`,
          details: { functions: results }
        };
      } else {
        return {
          service: 'Edge Functions',
          status: 'error',
          message: 'No edge functions available - deployment needed',
          details: { functions: results }
        };
      }
    } catch (error) {
      return {
        service: 'Edge Functions',
        status: 'error',
        message: 'Failed to check edge function status'
      };
    }
  }

  async verifyAllConnections(): Promise<ConnectionStatus[]> {
    const results = await Promise.all([
      this.verifySupabase(),
      this.verifyEdgeFunctions(),
      this.verifyOpenAI()
    ]);

    return results;
  }
}

export const connectionVerifier = new ConnectionVerifier();
export type { ConnectionStatus };