import { MailerModule } from '@nestjs-modules/mailer'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { ApiModule } from './api/api.module'
import { InfraModule } from './infra/infra.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true
		}),
		ApiModule,
		InfraModule
	]
})
export class AppModule {}
