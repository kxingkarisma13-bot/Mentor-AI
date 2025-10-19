import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { professionalId, durationMinutes } = await req.json();
    
    // Input validation
    if (!professionalId || typeof professionalId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid professional ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!durationMinutes || typeof durationMinutes !== 'number' || durationMinutes < 15 || durationMinutes > 240) {
      return new Response(
        JSON.stringify({ error: 'Duration must be between 15 and 240 minutes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get professional details and verify they are active and verified
    const { data: professional, error: profError } = await supabaseClient
      .from('professionals')
      .select('hourly_rate, display_name, specialties, is_verified, is_active')
      .eq('id', professionalId)
      .single();

    if (profError || !professional) {
      console.error('Professional lookup error:', profError);
      return new Response(
        JSON.stringify({ error: 'Professional not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL SECURITY CHECK: Verify professional is verified and active
    if (!professional.is_verified) {
      console.log('Consultation blocked: Professional not verified', { professionalId });
      return new Response(
        JSON.stringify({ 
          error: 'This professional is not yet verified. Please choose a verified professional.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!professional.is_active) {
      console.log('Consultation blocked: Professional not active', { professionalId });
      return new Response(
        JSON.stringify({ 
          error: 'This professional is currently unavailable for consultations.' 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total amount (hourly rate * duration in hours)
    const totalAmount = (professional.hourly_rate * durationMinutes) / 60;

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2025-08-27.basil',
    });

    // Create or get customer
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      customerId = customer.id;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      metadata: {
        professional_id: professionalId,
        user_id: user.id,
        duration_minutes: durationMinutes.toString()
      },
      description: `Consultation with ${professional.display_name}`,
    });

    // Create consultation record
    const { data: consultation, error: consultError } = await supabaseClient
      .from('consultations')
      .insert({
        user_id: user.id,
        professional_id: professionalId,
        specialty: professional.specialties[0],
        duration_minutes: durationMinutes,
        total_amount: totalAmount,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_payment_status: paymentIntent.status,
        status: 'pending'
      })
      .select()
      .single();

    if (consultError) {
      console.error('Consultation creation error:', consultError);
      throw new Error(`Failed to create consultation: ${consultError.message}`);
    }

    console.log('Consultation created successfully', {
      consultationId: consultation.id,
      userId: user.id,
      professionalId,
      amount: totalAmount,
      verified: professional.is_verified
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        consultationId: consultation.id,
        amount: totalAmount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating consultation payment:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
