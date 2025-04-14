import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { cancelOrderHtml, htmlTemplate } from 'src/order/html/orderMailTemp';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({

    service: process.env.SMTP_SERVICE,

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:${process.env.PORT || 3000}/auth/verify?token=${token}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Verify Your Email',
      html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const url = `http://localhost:${process.env.PORT || 3000}/auth/reset-password?token=${token}`;
    await this.transporter.sendMail({
      to: email,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
    });
  }

  async sendOrderConfirmation(userEmail: string, orderDetails: any) {
    try {
      await this.transporter.sendMail({
        to: userEmail, 
        subject: 'Order Confirmation', 
        html:htmlTemplate(orderDetails)
        
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }

  async sendOrderCancellation(userEmail: string, orderDetails: any){
    try {
      await this.transporter.sendMail({
        to: userEmail, 
        subject: 'Order Cancelation', 
        html:cancelOrderHtml(orderDetails)
        
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send order confirmation email');
    }
  }
}
