import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseFilters,
	UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { User } from '@prisma/client'
import type { Request, Response } from 'express'
import { Protected } from 'src/common/decorators'
import { IpAddress } from 'src/common/decorators/ipaddress.decorator'

import { AuthService } from './auth.service'
import {
	CheckEmailDto,
	ConfirmEmailDto,
	LoginRequest,
	RegisterRequest
} from './dto'
import { OAuthExceptionFilter } from './filters/oauth.filter'

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly configService: ConfigService
	) {}

	@Post('register')
	async register(@Body() dto: RegisterRequest, @IpAddress() ip: string) {
		return await this.authService.register(dto, ip)
	}

	@Post('login')
	async login(
		@Res({ passthrough: true }) res: Response,
		@Body() dto: LoginRequest,
		@IpAddress() ip: string
	) {
		return await this.authService.login(res, dto, ip)
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
		@Res({ passthrough: true }) res: Response,
		@IpAddress() ip: string
	) {
		return await this.authService.confirmEmail(res, dto, ip)
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() _req) {}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	@UseFilters(new OAuthExceptionFilter(new ConfigService()))
	async googleAuthRedirect(@Req() req, @Res() res: Response) {
		await this.authService.validateOAuthLogin(res, req)

		const frontendUrl = this.configService.getOrThrow<string>('CLIENT_URL')
		res.redirect(frontendUrl)
	}
}
