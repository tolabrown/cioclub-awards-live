import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const POST = async ({ request }) => {
  try {
    const { account_number, bank_code } = await request.json();

    const res = await fetch(`https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await res.json();
    return json(data);
  } catch (error: any) {
    console.error('Resolve account error:', error);
    return json({ status: false, message: 'Failed to resolve account' }, { status: 500 });
  }
};
