import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import type { Request, Response } from 'express'
import { Protected } from 'src/common/decorators'

import { AuthService } from './auth.service'
import {
	CheckEmailDto,
	ConfirmEmailDto,
	LoginRequest,
	RegisterRequest
} from './dto'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	@Post('register')
	async register(@Body() dto: RegisterRequest) {
		return await this.authService.register(dto)
	}

	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: LoginRequest
	) {
		return await this.authService.login(res, dto)
	}

	@Protected()
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: Response) {
		return await this.authService.logout(res)
	}

	@Post('refresh')
	async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	) {
		return await this.authService.refresh(req, res)
	}

	@Post('check-email')
	async checkEmail(@Body() dto: CheckEmailDto) {
		return this.authService.checkEmail(dto.email)
	}

	@Post('confirm')
	async confirmEmail(
		@Body() dto: ConfirmEmailDto,
		@Res({ passthrough: true }) res: Response
	) {
		return await this.authService.confirmEmail(res, dto)
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() _req) {}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	async googleAuthCallback(@Req() req, @Res() res: Response) {
		await this.authService.validateOAuthLogin(res, req)

		const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL')

		res.redirect(clientUrl)
	}
}
