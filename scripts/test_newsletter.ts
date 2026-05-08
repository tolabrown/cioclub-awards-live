
import { db } from './src/lib/db';
import { newsletterSubscriber } from './src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function testNewsletter() {
  const testEmail = 'test-' + Math.random() + '@example.com';

  console.log('Testing newsletter subscription for:', testEmail);

  try {
    // 1. Insert new subscriber
    console.log('Inserting...');
    await db.insert(newsletterSubscriber).values({ email: testEmail });
    console.log('Success: Inserted new subscriber.');

    // 2. Try to insert duplicate
    console.log('Testing duplicate check...');
    const existing = await db.query.newsletterSubscriber.findFirst({
      where: eq(newsletterSubscriber.email, testEmail)
    });

    if (existing) {
      console.log('Success: Duplicate detected correctly! Found:', existing.email);
    } else {
      console.error('Failure: Subscriber not found after insertion.');
    }

    // 3. Clean up (optional)
    // await db.delete(newsletterSubscriber).where(eq(newsletterSubscriber.email, testEmail));
    // console.log('Cleaned up test email.');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit();
  }
}

testNewsletter();
