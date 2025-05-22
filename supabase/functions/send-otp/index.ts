
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phone: string;
  code: string;
  factorId?: string;
}

// Kavenegar helper function
async function sendSMSViaKavenegar(phone: string, message: string): Promise<any> {
  const apiKey = Deno.env.get('KAVENEGAR_API_KEY');
  
  if (!apiKey) {
    throw new Error('KAVENEGAR_API_KEY is not set');
  }
  
  // Format phone number (remove leading 0 for Iranian numbers and add country code)
  let formattedPhone = phone;
  if (phone.startsWith('0')) {
    formattedPhone = `98${phone.substring(1)}`;
  } else if (!phone.startsWith('98') && !phone.startsWith('+98')) {
    formattedPhone = `98${phone}`;
  }
  
  // Remove any remaining '+' character
  formattedPhone = formattedPhone.replace('+', '');
  
  // Call Kavenegar API
  const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;
  const params = new URLSearchParams({
    receptor: formattedPhone,
    message: message,
  });
  
  const response = await fetch(`${url}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Kavenegar API error:', errorText);
    throw new Error(`Kavenegar API error: ${response.statusText}`);
  }
  
  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, code, factorId }: SMSRequest = await req.json();

    // Validate required parameters
    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: 'Phone number and code are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format the message (in Persian)
    const message = `کد تایید شما: ${code}\nاین کد تا ۱۰ دقیقه معتبر است.`;

    // Send SMS via Kavenegar
    const result = await sendSMSViaKavenegar(phone, message);
    
    console.log('SMS sent successfully:', result);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        factorId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-otp function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
