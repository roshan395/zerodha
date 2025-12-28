import crypto from 'crypto';

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { request_token } = await request.json();

    if (!request_token) {
      return new Response(JSON.stringify({ error: 'Request token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get environment variables
    const API_KEY = env.ZERODHA_API_KEY;
    const API_SECRET = env.ZERODHA_API_SECRET;

    if (!API_KEY || !API_SECRET) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate checksum: sha256(api_key + request_token + api_secret)
    const checksum = crypto
      .createHash('sha256')
      .update(API_KEY + request_token + API_SECRET)
      .digest('hex');

    // Exchange request token for access token
    const response = await fetch('https://api.kite.trade/session/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Kite-Version': '3'
      },
      body: new URLSearchParams({
        api_key: API_KEY,
        request_token: request_token,
        checksum: checksum
      })
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      return new Response(JSON.stringify({ 
        error: data.message || 'Failed to authenticate with Zerodha' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return access token and user info
    return new Response(JSON.stringify({
      access_token: data.data.access_token,
      user_id: data.data.user_id,
      user_name: data.data.user_name,
      email: data.data.email
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
