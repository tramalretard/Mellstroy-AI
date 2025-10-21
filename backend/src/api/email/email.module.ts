import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { EmailController } from './email.controller'
import { EmailService } from './email.service'

@Module({
	imports: [
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => ({
				transport: {
					host: config.get<string>('MAIL_HOST'),
					secure: false,
					auth: {
						user: config.get<string>('MAIL_USER'),
						pass: config.get<string>('MAIL_PASSWORD')
					}
				},
				defaults: {
					from: `"noreply" <${config.get<string>('MAIL_FROM')}>`
				}
			}),
			inject: [ConfigService]
		})
	],
	controllers: [EmailController],
	providers: [EmailService],
	exports: [EmailService]
})
export class EmailModule {}
