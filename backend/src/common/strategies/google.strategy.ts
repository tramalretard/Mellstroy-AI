import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor(private configService: ConfigService) {
		const clientID = configService.get<string>('GOOGLE_CLIENT_ID')
		const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET')
		const serverHost = configService.get<string>('SERVER_HOST')

		if (!clientID || !clientSecret || !serverHost) {
			throw new Error(
				'Значения GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET или SERVER_HOST в переменном окружении (.env) не найдены'
			)
		}

		super({
			clientID: clientID,
			clientSecret: clientSecret,
			callbackURL: serverHost + '/auth/google/callback',
			scope: ['profile', 'email']
		})
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: Profile,
		done: VerifyCallback
	) {
		const { displayName, emails, photos } = profile

		const email = emails && emails.length > 0 ? emails[0].value : undefined
		const picture =
			photos && photos.length > 0 ? photos[0].value : undefined

		const user = {
			email: email,
			username: displayName,
			picture: picture
		}

		done(null, user)
	}
}
