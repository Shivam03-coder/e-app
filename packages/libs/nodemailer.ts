import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import ejs from 'ejs';
import path from 'path';
import fs from 'fs';

dotenv.config();

class NodemailerService {
  private static transporter: Transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  public static async sendOtpEmail({
    email,
    otp,
    name,
  }: {
    email: string;
    otp: string;
    name: string;
  }): Promise<void> {
    try {

      console.log(process.cwd())
      // ✅ Fix template path relative to monorepo root
      const templatePath = path.join(
        process.cwd(),
        'packages',
        'templates',
        'otp-template.ejs'
      );

      console.log('📩 Using template at:', templatePath);

      if (!fs.existsSync(templatePath)) {
        throw new Error(`Template not found at: ${templatePath}`);
      }

      const html = await ejs.renderFile(templatePath, { name, otp });

      const mailOptions = {
        from: `"Your App Name" <${process.env.AUTH_EMAIL}>`,
        to: email,
        subject: 'Your OTP Code',
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      throw error;
    }
  }
}

export default NodemailerService;
