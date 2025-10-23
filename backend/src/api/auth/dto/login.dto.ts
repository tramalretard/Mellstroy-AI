import { Ip } from '@nestjs/common'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength
} from 'class-validator'

export class LoginRequest {
	@IsNotEmpty({ message: 'Пароль не может быть пустым' })
	@IsString({ message: 'Пароль может быть только строкой' })
	@MinLength(9, { message: 'Минимальная длина пароля - 9 символов' })
	password: string

	@IsNotEmpty({ message: 'Email не может быть пустым' })
	@IsEmail()
	email: string
}
