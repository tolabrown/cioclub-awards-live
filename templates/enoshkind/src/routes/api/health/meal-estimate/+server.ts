import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, contents, image } = await request.json();
    const webhookUrl = env.MEAL_ESTIMATOR;

    if (!webhookUrl) {
      console.error('[API/MealEstimate] MEAL_ESTIMATOR env var not set');
      return json(
        { success: false, message: 'Estimation service unavailable' },
        { status: 503 }
      );
    }

    // Forwarding to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        contents,
        image,
        userId: user.id,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API/MealEstimate] Webhook error: ${response.status}`, errorText);
      return json(
        { success: false, message: 'Failed to get estimate from AI service' },
        { status: response.status }
      );
    }

    const rawData = await response.json();

    // Parsing nested Gemini-style or simple nested object response from n8n
    let data = rawData;

    // Handle new format: [ { data: { ... } } ]
    if (Array.isArray(rawData) && rawData[0]?.data) {
      data = rawData[0].data;
    }
    // Handle legacy/Gemini format with Markdown block
    else if (Array.isArray(rawData) && rawData[0]?.content?.parts?.[0]?.text) {
      const text = rawData[0].content.parts[0].text;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          data = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error('[API/MealEstimate] Failed to parse extracted JSON', e);
        }
      } else {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('[API/MealEstimate] Failed to parse text as JSON', e);
        }
      }
    } else if (Array.isArray(rawData) && rawData.length > 0) {
      data = rawData[0];
    }

    // Expected format from parsed data: { calories: number, fats: number, carbs: number, protein: number }
    const estimate = {
      calories: Number(data.calories || 0),
      fats: Number(data.fats || 0),
      carbs: Number(data.carbs || 0),
      protein: Number(data.protein || 0)
    };

    return json({
      success: true,
      estimate
    });
  } catch (error: any) {
    console.error('[API/MealEstimate] Error:', error);
    return json(
      {
        success: false,
        message: error.message || 'Internal Server Error'
      },
      { status: 500 }
    );
  }
};
