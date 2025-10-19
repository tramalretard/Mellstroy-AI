import { Body, Controller, Post, Req, Res } from '@nestjs/common'
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
}
