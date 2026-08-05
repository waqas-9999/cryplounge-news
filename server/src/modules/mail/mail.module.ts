import { Global, Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';

/**
 * Global so any feature module can send mail without restating the import.
 * The controller is read-and-test only; credentials come from the environment
 * and are never writable through the API.
 */
@Global()
@Module({
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
