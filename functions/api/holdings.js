export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const { access_token } = await request.json();

    if (!access_token) {
      return new Response(JSON.stringify({ error: 'Access token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const API_KEY = env.ZERODHA_API_KEY;

    if (!API_KEY) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch holdings from Zerodha API
    const response = await fetch('https://api.kite.trade/portfolio/holdings', {
      method: 'GET',
      headers: {
        'Authorization': `token ${API_KEY}:${access_token}`,
        'X-Kite-Version': '3'
      }
    });

    const data = await response.json();

    if (!response.ok || data.status !== 'success') {
      // Token might be expired
      if (response.status === 403 || response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'Session expired. Please login again.',
          expired: true
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        error: data.message || 'Failed to fetch holdings' 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return holdings data
    return new Response(JSON.stringify({
      data: data.data
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

  } catch (error) {
    console.error('Holdings error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error: ' + error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
