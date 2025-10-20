import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { LoginRequest, RegisterRequest } from './dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	async register(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: RegisterRequest
	) {
		return await this.authService.register(res, dto)
	}

	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: LoginRequest
	) {
		return await this.authService.login(res, dto)
	}

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

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() _req) {}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	async googleAuthCallback(
		@Req() req,
		@Res({ passthrough: true }) res: Response
	) {
		const { accessToken } = await this.authService.validateOAuthLogin(
			res,
			req
		)

		return res.redirect(
			`${process.env['CLIENT_URL']}?accessToken=${accessToken}`
		)
	}
}
