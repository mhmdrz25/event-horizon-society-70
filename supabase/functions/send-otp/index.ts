
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.32.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Kavenegar API
const kavenegarApiKey = Deno.env.get('KAVENEGAR_API_KEY') || '';
const kavenegarUrl = 'https://api.kavenegar.com/v1';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { phone, code, factorId } = await req.json();

    if (!phone || !code || !factorId) {
      return new Response(
        JSON.stringify({ error: 'Phone number, code, and factorId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format phone number (remove '+' if present)
    const formattedPhone = phone.replace(/^\+/, '');

    // Verify factorId is valid by checking with Supabase
    const { data: factorData, error: factorError } = await supabase
      .from('auth_factors')
      .select('id')
      .eq('id', factorId)
      .single();

    if (factorError || !factorData) {
      console.error("Factor validation error:", factorError);
      return new Response(
        JSON.stringify({ error: 'Invalid factor ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via Kavenegar API
    const kavenegarParams = new URLSearchParams({
      receptor: formattedPhone,
      message: `Your verification code is: ${code}`,
    });

    const kavenegarResponse = await fetch(
      `${kavenegarUrl}/${kavenegarApiKey}/sms/send.json?${kavenegarParams.toString()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const kavenegarData = await kavenegarResponse.json();
    
    if (!kavenegarResponse.ok) {
      console.error("Kavenegar API error:", kavenegarData);
      return new Response(
        JSON.stringify({ error: 'Failed to send SMS', details: kavenegarData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: 'SMS sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error sending SMS:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
