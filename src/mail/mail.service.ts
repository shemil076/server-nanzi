import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import pug from 'pug';
import { join } from 'path';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // FIXME: true for port 465, false for others
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendTenantInvitation(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>,
    isTenant: boolean,
    text?: string,
  ) {
    try {
      if (!to || !subject || !template) {
        throw new BadRequestException(
          'Missing required fields: to, subject, or template',
        );
      }

      if (!context || typeof context !== 'object') {
        throw new BadRequestException('Context must be a valid object');
      }

      const renderFile = pug.renderFile as (
        path: string,
        options?: Record<string, any>,
      ) => string;

      const html = renderFile(
        join(__dirname, 'templates', `${template}.pug`),
        context,
      );

      const mailOptions = {
        from: this.configService.get<string>(
          'EMAIL_FROM',
          `${isTenant ? 'nanzi #tenant' : 'nanzi #landlord'} <no-reply@example.com>`,
        ),
        to,
        subject,
        text:
          text || 'Please view this email in an HTML-compatible email client.',
        html,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail(mailOptions);

      console.log(`Email sent successfully to ${to} with messageId: ${info}`);
      return { success: true };
    } catch (error) {
      // console.error(`Failed to send email to ${to}:`, error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }
}
