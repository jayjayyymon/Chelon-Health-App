declare const Deno: any;

const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY')
if (!openrouterApiKey) {
  console.error('OPENROUTER_API_KEY is not set')
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve({
  handler: async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      // Parse the request body
      const { messages } = await req.json()

      // Validate messages
      if (!Array.isArray(messages)) {
        return new Response(
          JSON.stringify({ error: 'Messages must be an array' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Restrict conversation history size (e.g., max 20 messages)
      if (messages.length > 20) {
        return new Response(
          JSON.stringify({ error: 'Conversation history too long (max 20 messages)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Validate each message
      for (const msg of messages) {
        if (!msg.role || !msg.content || typeof msg.content !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Each message must have a role and content string' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        // Restrict message length (e.g., max 1000 characters per message)
        if (msg.content.length > 1000) {
          return new Response(
            JSON.stringify({ error: 'Message too long (max 1000 characters)' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        // Reject empty messages
        if (msg.content.trim() === '') {
          return new Response(
            JSON.stringify({ error: 'Message cannot be empty' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      // Prepare the system instruction
      const systemInstruction = {
        role: 'system',
        content: `You are a general wellness information assistant for CHELON. You are empathetic, concise, and explain medical information in plain language. You avoid claiming to diagnose conditions or prescribe treatment. You advise seeking professional or emergency care when appropriate. You base your responses on the user's health data provided in the conversation. If you don't have enough information to answer accurately, you say so and suggest consulting a healthcare professional.`
      }

      // Prepare the messages for OpenRouter (system instruction + conversation history)
      const openrouterMessages = [systemInstruction, ...messages]

      // Call OpenRouter API
      const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://chelonexpo.app', // Optional, for OpenRouter analytics
          'X-Title': 'CHELON Health App', // Optional, for OpenRouter analytics
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: openrouterMessages,
          // Optional: set parameters like temperature, max_tokens, etc.
          temperature: 0.7,
          max_tokens: 500,
        })
      })

      if (!openrouterResponse.ok) {
        // Handle error responses from OpenRouter
        let errorMessage = 'Failed to get response from AI service'
        try {
          const errorData = await openrouterResponse.json()
          if (errorData.error?.message) {
            errorMessage = `AI service error: ${errorData.error.message}`
            // Do not expose internal details like API keys or internal errors
            // Just return a generic message to the client
          }
        } catch {
          // If we can't parse the error, use the status text
          errorMessage = `AI service error: ${openrouterResponse.statusText}`
        }
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { status: openrouterResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const data = await openrouterResponse.json()

      // Extract the assistant's response
      const assistantMessage = data.choices?.[0]?.message?.content

      if (!assistantMessage) {
        return new Response(
          JSON.stringify({ error: 'No response generated from AI service' }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return the assistant's message in a consistent JSON response
      return new Response(
        JSON.stringify({ message: assistantMessage }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Error in chelon-chat function:', error)
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }
})