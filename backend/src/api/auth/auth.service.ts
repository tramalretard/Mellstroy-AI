import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import {
	ConflictException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { User } from '@prisma/client'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import type { Request, Response } from 'express'
import Redis from 'ioredis'
import { isDev, ms, StringValue } from 'src/common/utils'
import { PrismaService } from 'src/infra/prisma/prisma.service'

import { EmailService } from '../email/email.service'
import { UserService } from '../user/user.service'

import { LoginRequest } from './dto/login.dto'
import { ConfirmEmailDto, RegisterRequest } from './dto/register.dto'
import { JwtPayload } from './interfaces'

@Injectable()
export class AuthService {
	private readonly JWT_ACCESS_TOKEN_TTL: StringValue
	private readonly JWT_REFRESH_TOKEN_TTL: StringValue

	private readonly COOKIES_DOMAIN: string

	private readonly EXPIRE_MINUTES_VERIFICATION_CODE: StringValue

	private readonly MAX_REQUESTS_EMAIL: number
	private readonly COOLDOWN_REQUESTS_EMAIL: StringValue

	private readonly MAX_REQUESTS_IP: number
	private readonly COOLDOWN_REQUESTS_IP: StringValue

	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private emailService: EmailService,

		@Inject('REDIS_CLIENT') private readonly redis: Redis
	) {
		this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<StringValue>(
			'JWT_ACCESS_TOKEN_TTL'
		)
		this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<StringValue>(
			'JWT_REFRESH_TOKEN_TTL'
		)

		this.EXPIRE_MINUTES_VERIFICATION_CODE =
			configService.getOrThrow<StringValue>(
				'EXPIRE_MINUTES_VERIFICATION_CODE'
			)

		this.COOKIES_DOMAIN = configService.getOrThrow<string>('COOKIES_DOMAIN')

		this.MAX_REQUESTS_EMAIL =
			configService.getOrThrow<number>('MAX_REQUESTS_EMAIL')
		this.COOLDOWN_REQUESTS_EMAIL = configService.getOrThrow<StringValue>(
			'COOLDOWN_REQUESTS_EMAIL'
		)

		this.MAX_REQUESTS_IP =
			configService.getOrThrow<number>('MAX_REQUESTS_IP')
		this.COOLDOWN_REQUESTS_IP = configService.getOrThrow<StringValue>(
			'COOLDOWN_REQUESTS_IP'
		)
	}

	async register(dto: RegisterRequest, ip: string) {
		const { username, password, email } = dto

		const isExists = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (isExists) {
			if (isExists.isVerified) {
				throw new ConflictException('Пользователь уже зарегистрирован')
			}

			await this.handleIpRequestLimit(ip)
			await this.handleEmailRequestLimit(email)

			const verificationCode = (
				await this.generateVerificationCode()
			).toString()

			const verificationCodeExpiresAt = new Date(
				Date.now() + ms(this.EXPIRE_MINUTES_VERIFICATION_CODE)
			)

			const hashPassword = await hash(password)
			const hashVerificationCode = await hash(verificationCode)

			await this.prismaService.user.update({
				where: { id: isExists.id },
				data: {
					password: hashPassword,
					verificationCode: hashVerificationCode,
					verificationCodeExpiresAt,
					username
				}
			})

			/* await this.emailService.sendUserConfirmation(
				isExists.email,
				verificationCode
			) */
			console.log(verificationCode)
			return {
				message:
					'Мы отправили Вам новый код подтверждения. Пожалуйста, проверьте почту',
				resent: true
			}
		}

		const verificationCode = (
			await this.generateVerificationCode()
		).toString()

		const verificationCodeExpiresAt = new Date(
			Date.now() + ms(this.EXPIRE_MINUTES_VERIFICATION_CODE)
		)

		const hashPassword = await hash(password)
		const hashVerificationCode = await hash(verificationCode)

		const user = await this.prismaService.user.create({
			data: {
				username,
				password: hashPassword,
				email,
				verificationCode: hashVerificationCode,
				verificationCodeExpiresAt
			}
		})

		await this.emailService.sendUserConfirmation(
			user.email,
			verificationCode
		)

		return {
			message:
				'Регистрация прошла успешно. Пожалуйста, проверьте вашу почту и введите код подтверждения'
		}
	}

	async login(res: Response, dto: LoginRequest, ip: string) {
		const { email, password } = dto

		const user = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		await this.handleIpRequestLimit(ip)
		await this.handleEmailRequestLimit(email)

		if (!user) throw new NotFoundException('Неверный email или пароль')

		const isValidPassword = await verify(user.password!, password)

		if (!isValidPassword)
			throw new NotFoundException('Неверный email или пароль')

		if (!user.isVerified) {
			throw new UnauthorizedException(
				'Попробуйте зарегистрироваться заново'
			)
		}

		return this.auth(res, user)
	}

	private async generateVerificationCode(): Promise<string> {
		const numBytes = 3
		const buffer = randomBytes(numBytes)
		const randomNumber = buffer.readUIntBE(0, numBytes)
		const min = 100000
		const max = 999999
		const range = max - min + 1
		const sixDigitNumber = (randomNumber % range) + min
		return sixDigitNumber.toString()
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
		const { email } = req.user

		await this.handleEmailRequestLimit(email)

		const user = await this.findOrCreateUserByOAuth(req)

		return this.auth(res, user)
	}

	private async handleIpRequestLimit(ip: string): Promise<void> {
		const maxAttempts = this.MAX_REQUESTS_IP
		const cooldownSeconds = ms(this.COOLDOWN_REQUESTS_IP) / 1000

		const key = `rate-limit:ip:${ip}`

		const currentCount = await this.redis.get(key)

		if (currentCount && Number(currentCount) >= maxAttempts) {
			const ttl = await this.redis.ttl(key)
			throw new BadRequestException({
				message: 'Превышен лимит запросов для вашего IP',
				cooldown: ttl > 0 ? ttl : 0
			})
		}

		const pipeline = this.redis.pipeline()
		pipeline.incr(key)

		if (!currentCount) {
			pipeline.expire(key, cooldownSeconds)
		}

		await pipeline.exec()
	}

	private async handleEmailRequestLimit(email: string): Promise<void> {
		const maxAttempts = this.MAX_REQUESTS_EMAIL
		const coolDownRequest = ms(this.COOLDOWN_REQUESTS_EMAIL)

		const user = await this.prismaService.user.findUnique({
			where: { email }
		})

		if (!user) {
			return
		}

		const now = new Date()
		const lastRequestAt = user.lastRequestAt
		const attempts = user.currentRequestEmail ?? 0

		if (
			lastRequestAt &&
			now.getTime() < lastRequestAt.getTime() + coolDownRequest
		) {
			if (attempts >= maxAttempts) {
				const timeLeft =
					lastRequestAt.getTime() + coolDownRequest - now.getTime()
				const secondsLeft = Math.ceil(timeLeft / 1000)

				throw new BadRequestException({
					message: 'Превышен лимит запросов',
					cooldown: secondsLeft
				})
			}

			await this.prismaService.user.update({
				where: { email },
				data: {
					currentRequestEmail: attempts + 1,
					lastRequestAt: now
				}
			})
		} else {
			await this.prismaService.user.update({
				where: { email },
				data: {
					currentRequestEmail: 1,
					lastRequestAt: now
				}
			})
		}
	}

	async checkEmail(email: string) {
		const user = await this.prismaService.user.findUnique({
			where: { email }
		})

		if (user && user.isVerified) {
			throw new ConflictException('Пользователь уже зарегистрирован')
		}

		return { message: 'Email доступен для регистрации' }
	}

	async confirmEmail(res: Response, dto: ConfirmEmailDto, ip: string) {
		const isExist = await this.prismaService.user.findUnique({
			where: { email: dto.email }
		})

		if (!isExist) throw new NotFoundException('Пользователь не найден')

		if (isExist.isVerified)
			throw new BadRequestException('Email уже подтвержден')

		if (!isExist.verificationCode || !isExist.verificationCodeExpiresAt) {
			throw new BadRequestException(
				'Код подтверждения отсутствует или не был сгенерирован'
			)
		}

		if (isExist.verificationCodeExpiresAt < new Date()) {
			throw new BadRequestException(
				'Срок действия кода истек. Пожалуйста, запросите новый код'
			)
		}

		await this.handleIpRequestLimit(ip)
		await this.handleEmailRequestLimit(isExist.email)

		const isValidVerificationCode = await verify(
			isExist.verificationCode,
			dto.code
		)

		if (!isValidVerificationCode) {
			throw new BadRequestException('Неверный код подтверждения')
		}

		const updatedUser = await this.prismaService.user.update({
			where: { id: isExist.id },
			data: {
				isVerified: true,
				verificationCode: null,
				verificationCodeExpiresAt: null
			}
		})

		const { password } = updatedUser

		return this.auth(res, isExist)
	}
}
