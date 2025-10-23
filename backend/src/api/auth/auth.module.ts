import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from 'src/common/strategies'
import { GoogleStrategy } from 'src/common/strategies/google.strategy'
import { getJwtConfig } from 'src/configs'

import { EmailModule } from '../email/email.module'
import { UserService } from '../user/user.service'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { OAuthExceptionFilter } from './filters/oauth.filter'

@Module({
	imports: [
		PassportModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: getJwtConfig,
			inject: [ConfigService]
		}),
		EmailModule
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		UserService,
		GoogleStrategy,
		OAuthExceptionFilter
	]
})
export class AuthModule {}
