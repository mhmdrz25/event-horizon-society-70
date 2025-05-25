
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phone: string;
  message: string;
  submissionId?: string;
}

// Kavenegar helper function
async function sendSMSViaKavenegar(phone: string, message: string): Promise<any> {
  const apiKey = Deno.env.get('KAVENEGAR_API_KEY');
  
  if (!apiKey) {
    throw new Error('KAVENEGAR_API_KEY is not set');
  }
  
  // Format phone number (remove leading 0 for Iranian numbers and add country code)
  let formattedPhone = phone;
  if (phone.startsWith('+98')) {
    formattedPhone = phone.substring(3);
  } else if (phone.startsWith('98')) {
    formattedPhone = phone.substring(2);
  } else if (phone.startsWith('0')) {
    formattedPhone = phone.substring(1);
  }
  
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
    const { phone, message, submissionId }: SMSRequest = await req.json();

    // Validate required parameters
    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone number and message are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate Iranian phone number format
    const iranianPhoneRegex = /^\+98[0-9]{10}$/;
    if (!iranianPhoneRegex.test(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Iranian phone number format. Use +98xxxxxxxxxx' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send SMS via Kavenegar
    const result = await sendSMSViaKavenegar(phone, message);
    
    console.log('SMS sent successfully:', result);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        submissionId,
        result
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-sms function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
