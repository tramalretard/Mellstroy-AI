import { z } from 'zod'

export const registerSchema = z
	.object({
		email: z
			.string()
			.email({ message: 'Введите корректную почту' })
			.refine(email => !email.toLowerCase().endsWith('@yandex.ru'), {
				message: 'Fuck Yandex'
			}),
		password: z
			.string()
			.min(9, { message: 'Пароль должен быть не менее 9 символов' }),
		confirmPassword: z.string(),
		code: z.string().min(6, { message: 'Код должен состоять из 6 цифр' })
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Пароли не совпадают',
		path: ['confirmPassword']
	})

export const loginSchema = z.object({
	email: z
		.string()
		.email({ message: 'Введите корректную почту' })
		.refine(email => !email.toLowerCase().endsWith('@yandex.ru'), {
			message: 'Fuck Yandex'
		}),
	password: z.string().min(1, { message: 'Введите пароль' })
})

export type RegisterFormValues = z.infer<typeof registerSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
