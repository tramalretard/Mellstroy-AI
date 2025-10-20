import { Controller, Get } from '@nestjs/common'
import type { User } from '@prisma/client'
import { Authorized, Protected } from 'src/common/decorators'

import { UserService } from './user.service'

type UserResponse = Omit<User, 'password'>

@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('me')
	@Protected()
	async getProfile(@Authorized() user: User): Promise<UserResponse> {
		const { password, ...userWithoutPassword } = user

		return userWithoutPassword
	}
}
