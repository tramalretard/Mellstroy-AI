import { Injectable } from '@nestjs/common'
import {
	ConflictException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { hash, verify } from 'argon2'
import type { Request, Response } from 'express'
import { isDev, ms, StringValue } from 'src/common/utils'
import { PrismaService } from 'src/infra/prisma/prisma.service'

import { UserService } from '../user/user.service'

import { LoginRequest } from './dto/login.dto'
import { RegisterRequest } from './dto/register.dto'
import { JwtPayload } from './interfaces'

@Injectable()
export class AuthService {
	private readonly JWT_ACCESS_TOKEN_TTL: StringValue
	private readonly JWT_REFRESH_TOKEN_TTL: StringValue

	private readonly COOKIES_DOMAIN: string

	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly userService: UserService
	) {
		this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<StringValue>(
			'JWT_ACCESS_TOKEN_TTL'
		)
		this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<StringValue>(
			'JWT_REFRESH_TOKEN_TTL'
		)

		this.COOKIES_DOMAIN = configService.getOrThrow<string>('COOKIES_DOMAIN')
	}

	async register(res: Response, dto: RegisterRequest) {
		const { username, password, email } = dto

		const isExists = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (isExists)
			throw new ConflictException(
				'Пользователь с таким email уже зарегистрирован'
			)

		const hashPassword = await hash(password)

		const user = await this.prismaService.user.create({
			data: {
				username,
				password: hashPassword,
				email
			}
		})

		return this.auth(res, user)
	}

	async login(res: Response, dto: LoginRequest) {
		const { email, password } = dto

		const user = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (!user) throw new NotFoundException('Неверный email или пароль')

		const isValidPassword = await verify(user.password!, password)

		if (!isValidPassword)
			throw new NotFoundException('Неверный email или пароль')

		return this.auth(res, user)
	}

	async refresh(req: Request, res: Response) {
		const refreshToken = req.cookies['refreshToken']

		if (!refreshToken) {
			throw new UnauthorizedException('Refresh токен не найден')
		}

		try {
			const payload: JwtPayload =
				await this.jwtService.verifyAsync(refreshToken)

			const user = await this.prismaService.user.findUnique({
				where: { id: payload.id }
			})

			if (!user) {
				throw new UnauthorizedException(
					'Пользователь для токена не найден'
				)
			}

			return this.auth(res, user)
		} catch (error) {
			throw new UnauthorizedException(
				'Невалидный или истекший refresh токен'
			)
		}
	}

	async logout(res: Response) {
		res.clearCookie('accessToken', {
			domain: this.COOKIES_DOMAIN,
			httpOnly: true,
			secure: !isDev(this.configService),
			sameSite: 'lax',
			path: '/'
		})

		res.clearCookie('refreshToken', {
			domain: this.COOKIES_DOMAIN,
			httpOnly: true,
			secure: !isDev(this.configService),
			sameSite: 'lax',
			path: '/'
		})

		res.status(200).json({ message: 'Успешный выход из системы' })
	}

	private async auth(res: Response, user: User) {
		const { accessToken, refreshToken, refreshTokenExpires } =
			await this.generateTokens(user)

		this.setCookies(res, refreshToken, accessToken, refreshTokenExpires)

		return {
			id: user.id,
			email: user.email,
			username: user.username,
			picture: user.picture
		}
	}

	private async generateTokens(user: User) {
		const payload: JwtPayload = {
			id: user.id
		}

		const refreshTokenExpires = new Date(
			Date.now() + ms(this.JWT_REFRESH_TOKEN_TTL)
		)

		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.JWT_ACCESS_TOKEN_TTL
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: this.JWT_REFRESH_TOKEN_TTL
		})

		return {
			accessToken,
			refreshToken,
			refreshTokenExpires
		}
	}

	setCookies(
		res: Response,
		refreshToken: string,
		accessToken: string,
		refreshTokenExpires: Date
	) {
		res.cookie('accessToken', accessToken, {
			httpOnly: true,
			domain: this.COOKIES_DOMAIN,
			maxAge: ms(this.JWT_ACCESS_TOKEN_TTL),
			secure: !isDev(this.configService),
			sameSite: 'lax',
			path: '/'
		})

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			domain: this.COOKIES_DOMAIN,
			expires: refreshTokenExpires,
			secure: !isDev(this.configService),
			sameSite: 'lax',
			path: '/'
		})
	}

	async findOrCreateUserByOAuth(req: {
		user: {
			email: string
			name: string
			picture?: string
			username?: string
		}
	}) {
		let user = await this.userService.getByEmail(req.user.email)

		if (!user) {
			user = await this.prismaService.user.create({
				data: {
					email: req.user.email,
					username: req.user.username || req.user.name,
					picture: req.user.picture
				}
			})
		}

		return user
	}

	async validateOAuthLogin(
		res: Response,
		req: {
			user: {
				email: string
				name: string
				picture?: string
			}
		}
	) {
		const user = await this.findOrCreateUserByOAuth(req)

		return this.auth(res, user)
	}
}
