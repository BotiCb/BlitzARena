import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { config } from 'src/shared/config/config';
import { UserModel } from 'src/shared/schemas/collections/user.schema';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // host: config.get('email.smtpHost'),
      // port: 587,
      // secure: false, // use false for STARTTLS; true for SSL on port 465
      service: 'gmail',
      auth: {
        user: config.get('email.smtpUser'),
        pass: config.get('email.smtpPass'),
      },
    });
  }

  private async sendMail(to: string, subject: string, text: string, html: string): Promise<void> {
    if (config.get('testMode')) {
      return;
    }

    const mailOptions = {
      from: config.get('email.fromEmail'),
      to,
      subject,
      text,
      html,
    };
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }

  async succesfullRegistration(user: UserModel) {
    const { email, firstName, lastName } = user;
    const subject = 'Registration Successful';
    const text = `Dear ${firstName} ${lastName},\n\nYour registration was successful. You can now log in to your account using your email and password.\n\nThank you for using our service.`;
    const html = `<h1 color="blue">Dear ${firstName} ${lastName},</h1><br><br>Your registration was successful. You can now log in to your account using your email and password.<br><br>Thank you for using our service.`;
    await this.sendMail(email, subject, text, html);
  }

  async userDeleted(user: UserModel) {
    const { email, firstName, lastName } = user;
    const subject = 'Account Deleted';
    const text = `Dear ${firstName} ${lastName},\n\nYour account was deleted. \n\nThank you for using our service.`;
    const html = `<h1 color="blue">Dear ${firstName} ${lastName},</h1><br><br>Your account was deleted. <br><br>Thank you for using our service.`;
    await this.sendMail(email, subject, text, html);
  }
}
