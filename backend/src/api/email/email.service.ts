import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendUserConfirmation(email: string, code: string) {
		await this.mailerService.sendMail({
			to: email,
			subject: 'Подтверждение регистрации на Mellstroy.AI',
			html: `
        <h1>Добро пожаловать!</h1>
        <p>Спасибо за регистрацию. Пожалуйста, используйте этот код для подтверждения вашего аккаунта:</p>
        <h2>${code}</h2>
        <p>Если вы не регистрировались, просто проигнорируйте это письмо.</p>
      `
		})
	}
}
