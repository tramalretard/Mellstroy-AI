import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/infra/prisma/prisma.service'

@Injectable()
export class UserService {
	constructor(private readonly prismaService: PrismaService) {}

	async getByEmail(email: string) {
		return this.prismaService.user.findUnique({ where: { email } })
	}
}
