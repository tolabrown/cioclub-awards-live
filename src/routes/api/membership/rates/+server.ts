import { json } from '@sveltejs/kit';
import { getExchangeRate } from '$lib/server/flutterwave';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const to = url.searchParams.get('to');
    
    if (!to) {
        return json({ error: 'Missing "to" currency parameter' }, { status: 400 });
    }
    
    try {
        const rate = await getExchangeRate(to);
        return json({ rate });
    } catch (error: any) {
        console.error('Error fetching rate in API:', error);
        return json({ error: error.message || 'Failed to fetch exchange rate' }, { status: 500 });
    }
};
