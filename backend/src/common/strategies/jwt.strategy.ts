import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import type { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { JwtPayload } from 'src/api/auth/interfaces'
import { PrismaService } from 'src/infra/prisma/prisma.service'

const cookieExtractor = (req: Request): string | null => {
	if (req && req.cookies) {
		return req.cookies['accessToken']
	}
	return null
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
			ignoreExpiration: false,
			secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
			algorithms: ['HS256']
		})
	}

	async validate(payload: JwtPayload) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id: payload.id
			}
		})

		if (!user) {
			throw new UnauthorizedException('Пользователь не найден')
		}

		return user
	}
}
