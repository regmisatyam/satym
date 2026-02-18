import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Create Zoho SMTP transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    // Email to site owner (Satyam)
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.ZOHO_EMAIL}>`,
      to: process.env.ZOHO_EMAIL,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">New Contact Form Submission</h2>
          <hr style="border: 1px solid #e5e7eb;" />
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          <h3 style="color: #374151;">Message:</h3>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: 1px solid #e5e7eb; margin-top: 24px;" />
          <p style="color: #9ca3af; font-size: 12px;">Sent from your portfolio website contact form.</p>
        </div>
      `,
    });

    // Confirmation email to the sender
    await transporter.sendMail({
      from: `"Satyam Regmi" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Thank you for reaching out!</h2>
          <p>Hi ${name},</p>
          <p>I've received your message and will get back to you as soon as possible.</p>
          <p>Here's a copy of your message:</p>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <br />
          <p>Best regards,<br /><strong>Satyam Regmi</strong></p>
          <p style="color: #9ca3af; font-size: 12px;">
            <a href="https://www.satym.me" style="color: #6366f1;">satym.me</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
