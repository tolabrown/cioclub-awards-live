import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAvailableLabTests, addLabTest, updateLabTest, deleteLabTest } from '$lib/db/lab';

const SEED_DATA = [
  { name: 'Full Ancestry & Health DNA', category: 'DNA & GENETICS', price: 12000000, popular: true, description: 'Comprehensive genetic analysis covering ancestry and health predispositions.' },
  { name: 'Genetic Predisposition Screen', category: 'DNA & GENETICS', price: 8500000, popular: false, description: 'Screening for common genetic health markers.' },
  { name: 'HBA1C (Diabetes Monitor)', category: 'CHRONIC CARE SCREENING', price: 850000, popular: true, description: 'Measures your average blood sugar levels over the past 3 months.' },
  { name: 'Lipid Profile (Cholesterol)', category: 'CHRONIC CARE SCREENING', price: 1200000, popular: false, description: 'Measures cholesterol and triglyceride levels in your blood.' }
];

export const GET: RequestHandler = async () => {
  try {
    let tests = await getAvailableLabTests();

    if (tests.length === 0) {
      console.log('Seeding lab tests...');
      for (const item of SEED_DATA) {
        await addLabTest(item);
      }
      tests = await getAvailableLabTests();
    }

    return json({ success: true, data: tests });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const test = await addLabTest(body);
    return json({ success: true, data: test });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id, ...data } = await request.json();
    const test = await updateLabTest(id, data);
    return json({ success: true, data: test });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  if (locals.user?.role !== 'admin') {
    return json({ success: false, message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const id = url.searchParams.get('id');
    if (!id) return json({ success: false, message: 'Missing ID' }, { status: 400 });

    await deleteLabTest(id);
    return json({ success: true });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};
