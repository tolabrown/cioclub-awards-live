import { json, type RequestHandler } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, fetch }) => {
  let description: string;
  try {
    const body = await request.json();
    description = body.description;
  } catch (e) {
    return json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  if (!description) {
    return json({ error: 'Description is required' }, { status: 400 });
  }

  const webhookUrl = env.PRODUCT_AGENT;

  if (!webhookUrl || webhookUrl === 'ecommerce') {
    console.error('PRODUCT_AGENT webhook URL not correctly configured:', webhookUrl);
    return json({ error: 'AI Agent not configured or invalid URL' }, { status: 500 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    const contentType = response.headers.get('content-type');
    const responseText = await response.text();

    if (!response.ok) {
      console.error('AI Agent error response:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText
      });

      let errorMessage = 'AI Agent returned an error';
      if (responseText.includes('webhook is not registered for POST requests')) {
        errorMessage = 'AI Agent Webhook is configured for GET, but we sent a POST. Please update n8n to accept POST.';
      }

      return json({ error: errorMessage, details: responseText }, { status: 502 });
    }

    if (!responseText || responseText.trim() === '') {
      console.error('AI Agent returned an empty response');
      return json({ error: 'AI Agent returned an empty response' }, { status: 502 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse AI Agent response as JSON:', responseText);
      return json({ error: 'AI Agent returned invalid JSON', details: responseText }, { status: 502 });
    }

    // Some n8n agents return data in an array or wrapped in an 'output' field
    const rawResult = Array.isArray(data) ? data[0] : data;
    const result = rawResult?.output || rawResult;

    if (!result) {
      return json({ error: 'AI Agent returned no data' }, { status: 502 });
    }

    // Map the specific fields from the user's agent output
    const mappedFeatures = Array.isArray(result.features)
      ? result.features.map((f: any) => ({ name: f.name, value: f.value }))
      : [];

    let marketPrice = null;
    if (result.current_market_price?.amount) {
      marketPrice = result.current_market_price.amount;
    } else if (result.marketPrice) {
      marketPrice = result.marketPrice;
    }

    return json({
      description: result.enhanced_description || result.enhancedDescription || result.description || '',
      features: mappedFeatures,
      marketPrice: marketPrice,
      metaTitle: result.seo_meta_title || result.metaTitle || '',
      metaDescription: result.seo_meta_description || result.metaDescription || ''
    });
  } catch (error) {
    console.error('Failed to call AI Agent:', error);
    return json({ error: 'Failed to communicate with AI Agent' }, { status: 500 });
  }
};
