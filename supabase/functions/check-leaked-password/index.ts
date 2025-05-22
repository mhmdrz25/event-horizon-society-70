
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createHash } from "https://deno.land/std@0.224.0/crypto/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { password } = await req.json();

    if (!password) {
      return new Response(
        JSON.stringify({ error: 'Password is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash the password with SHA-1 (required by HIBP API)
    const sha1Password = createHash("sha1").update(password).toString();
    const prefix = sha1Password.substring(0, 5).toUpperCase();
    const suffix = sha1Password.substring(5).toUpperCase();

    // Call the HIBP API with the prefix
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    
    if (!response.ok) {
      throw new Error(`HIBP API error: ${response.statusText}`);
    }

    // Check if our password appears in the results
    const hashes = await response.text();
    const hashLines = hashes.split('\n');
    
    // Each line is formatted as "HASH_SUFFIX:COUNT"
    const matchingHash = hashLines.find(line => line.startsWith(suffix));
    
    let isCompromised = false;
    let occurrences = 0;
    
    if (matchingHash) {
      isCompromised = true;
      occurrences = parseInt(matchingHash.split(':')[1], 10);
    }

    // Return result
    return new Response(
      JSON.stringify({ 
        isCompromised, 
        occurrences,
        message: isCompromised 
          ? `This password has been found in ${occurrences} data breaches` 
          : 'Password not found in known data breaches'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
