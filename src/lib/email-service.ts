import { logger, metrics } from "@/lib/monitoring";

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export class EmailService {
  private static instance: EmailService;
  private from: string;

  private constructor() {
    this.from = process.env.EMAIL_FROM || "noreply@travelhub.com";
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      logger.info("Sending email", {
        to: recipients,
        subject: options.subject,
        from: options.from || this.from,
      });

      // In production, integrate with SendGrid, AWS SES, or similar
      // For now, we'll simulate email sending
      
      if (process.env.NODE_ENV === "production" && process.env.SENDGRID_API_KEY) {
        // SendGrid integration example
        // const sgMail = require('@sendgrid/mail');
        // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        // await sgMail.send({
        //   to: recipients,
        //   from: options.from || this.from,
        //   subject: options.subject,
        //   html: options.html,
        //   text: options.text,
        // });
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      metrics.increment("emails.sent");
      logger.info("Email sent successfully", { messageId, to: recipients });

      return { success: true, messageId };
    } catch (error) {
      logger.error("Email sending failed", error as Error, {
        to: options.to,
        subject: options.subject,
      });

      metrics.increment("emails.failed");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Email sending failed",
      };
    }
  }

  // Predefined email templates
  bookingConfirmation(data: {
    bookingId: string;
    userName: string;
    bookingType: string;
    travelDate: string;
    amount: number;
  }): EmailTemplate {
    return {
      subject: `Booking Confirmation #${data.bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
              .content { background: #f9fafb; padding: 30px; }
              .booking-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
              .button { display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Confirmed!</h1>
              </div>
              <div class="content">
                <p>Hi ${data.userName},</p>
                <p>Your booking has been confirmed. Here are the details:</p>
                <div class="booking-details">
                  <div class="detail-row">
                    <span><strong>Booking ID:</strong></span>
                    <span>${data.bookingId}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Type:</strong></span>
                    <span>${data.bookingType}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Travel Date:</strong></span>
                    <span>${new Date(data.travelDate).toLocaleDateString()}</span>
                  </div>
                  <div class="detail-row">
                    <span><strong>Amount Paid:</strong></span>
                    <span>$${data.amount.toFixed(2)}</span>
                  </div>
                </div>
                <center>
                  <a href="https://travelhub.com/bookings/${data.bookingId}" class="button">View Booking Details</a>
                </center>
                <p>If you have any questions, please don't hesitate to contact our support team.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 TravelHub. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Booking Confirmed!
        
        Hi ${data.userName},
        
        Your booking has been confirmed. Here are the details:
        
        Booking ID: ${data.bookingId}
        Type: ${data.bookingType}
        Travel Date: ${new Date(data.travelDate).toLocaleDateString()}
        Amount Paid: $${data.amount.toFixed(2)}
        
        View your booking at: https://travelhub.com/bookings/${data.bookingId}
        
        If you have any questions, please contact our support team.
        
        Best regards,
        TravelHub Team
      `,
    };
  }

  passwordReset(data: { userName: string; resetToken: string }): EmailTemplate {
    return {
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Password Reset Request</h2>
              <p>Hi ${data.userName},</p>
              <p>We received a request to reset your password. Click the button below to proceed:</p>
              <a href="https://travelhub.com/reset-password?token=${data.resetToken}" 
                 style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Reset Password
              </a>
              <p>This link will expire in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <p>Best regards,<br>TravelHub Team</p>
            </div>
          </body>
        </html>
      `,
    };
  }

  paymentReceipt(data: {
    userName: string;
    amount: number;
    transactionId: string;
    date: string;
  }): EmailTemplate {
    return {
      subject: `Payment Receipt - ${data.transactionId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Payment Receipt</h2>
              <p>Hi ${data.userName},</p>
              <p>Thank you for your payment. Here's your receipt:</p>
              <div style="background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px;">
                <p><strong>Amount:</strong> $${data.amount.toFixed(2)}</p>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
              </div>
              <p>Best regards,<br>TravelHub Team</p>
            </div>
          </body>
        </html>
      `,
    };
  }
}

export const emailService = EmailService.getInstance();
