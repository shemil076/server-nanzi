import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  // imports: [
  //   ConfigModule,
  //   MailerModule.forRootAsync({
  //     imports: [ConfigModule],
  //     useFactory: (configService: ConfigService) => ({
  //       transport: {
  //         host: configService.get<string>('MAIL_HOST'),
  //         port: configService.get<number>('MAIL_PORT'),
  //         secure: false, // true for the port 465 and false for teh port 587
  //         auth: {
  //           user: configService.get<string>('MAIL_USER'),
  //           pass: configService.get<string>('MAIL_PASS'),
  //         },
  //         template: {
  //           dir: __dirname + '/templates',
  //           adapter: new PugAdapter(),
  //           options: {
  //             strict: true,
  //           },
  //         },
  //       },
  //     }),
  //   }),
  // ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
