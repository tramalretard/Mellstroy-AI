import {
	ArgumentsHost,
	BadRequestException,
	Catch,
	ExceptionFilter
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

@Catch(BadRequestException)
export class OAuthExceptionFilter implements ExceptionFilter {
	private readonly CLIENT_URL: string

	constructor(private readonly configService: ConfigService) {
		this.CLIENT_URL = configService.getOrThrow<string>('CLIENT_URL')
	}

	catch(exception: BadRequestException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const exceptionResponse = exception.getResponse() as any

		if (
			typeof exceptionResponse === 'object' &&
			exceptionResponse.cooldown
		) {
			const frontendUrl = this.CLIENT_URL

			const errorMessage = encodeURIComponent(exceptionResponse.message)
			const cooldown = exceptionResponse.cooldown

			const redirectUrl = `${frontendUrl}/auth?error=rate_limit&message=${errorMessage}&cooldown=${cooldown}`

			response.redirect(redirectUrl)
		} else {
			response.status(400).json(exceptionResponse)
		}
	}
}
