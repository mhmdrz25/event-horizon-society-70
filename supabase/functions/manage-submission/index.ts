
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManageSubmissionRequest {
  submissionId: string;
  status: 'approved' | 'rejected';
  comment?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header missing' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if user is admin
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || userProfile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { submissionId, status, comment }: ManageSubmissionRequest = await req.json();

    if (!submissionId || !status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: submissionId and status' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update submission status
    const { data: submission, error: updateError } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', submissionId)
      .select('*, user:users(name, email)')
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add admin comment if provided
    if (comment) {
      const { error: commentError } = await supabase
        .from('submission_comments')
        .insert({
          submission_id: submissionId,
          admin_id: user.id,
          comment
        });

      if (commentError) {
        console.error('Error adding comment:', commentError);
      }
    }

    // Create notification for the submission author
    const notificationMessage = status === 'approved' 
      ? `درخواست شما با عنوان "${submission.title}" تایید شد`
      : `درخواست شما با عنوان "${submission.title}" رد شد`;

    await supabase
      .from('notifications')
      .insert({
        user_id: submission.user_id,
        message: notificationMessage
      });

    console.log(`Submission ${submissionId} ${status} by admin ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Submission ${status} successfully`,
        submission
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in manage-submission function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
