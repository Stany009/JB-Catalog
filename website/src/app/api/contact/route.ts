import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, product, message } = body;

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Name and message are required' },
        { status: 400 }
      );
    }

    const contactEmail = process.env.CONTACT_EMAIL;

    // Log the enquiry (for now; replace with actual email service when configured)
    console.log('=== NEW ENQUIRY ===');
    console.log('Name:', name);
    console.log('Phone:', phone || 'Not provided');
    console.log('Email:', email || 'Not provided');
    console.log('Product:', product || 'Not specified');
    console.log('Message:', message);
    console.log('Time:', new Date().toISOString());
    console.log('==================');

    // If CONTACT_EMAIL is configured, you can integrate with an email service here.
    // For now, we log the enquiry and return success so the UI works correctly.
    // To add email delivery, uncomment and configure one of:
    // - Resend: https://resend.com
    // - SendGrid: https://sendgrid.com
    // - Nodemailer with SMTP

    if (!contactEmail) {
      console.log('Note: CONTACT_EMAIL env not set. Enquiry logged but not emailed.');
    }

    return NextResponse.json({
      success: true,
      message: 'Enquiry submitted successfully',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to process enquiry' },
      { status: 500 }
    );
  }
}
