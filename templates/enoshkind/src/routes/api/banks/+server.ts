import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = async () => {
  try {
    const res = await fetch('https://api.paystack.co/bank', {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
      }
    });
    const data = await res.json();
    return json(data);
  } catch (error: any) {
    console.error('Fetch banks error:', error);
    return json({ status: false, message: 'Failed to fetch banks' }, { status: 500 });
  }
};
