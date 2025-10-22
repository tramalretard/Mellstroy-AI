import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import * as path from 'path'

import * as fs from 'fs/promises'

@Injectable()
export class EmailService {
	constructor(private readonly mailerService: MailerService) {}

	async sendUserConfirmation(email: string, code: string) {
		const htmlTemplatePath = path.join(
			__dirname,
			'emails',
			'verificationcode.html'
		)

		const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf-8')

		let finalHtml = htmlTemplate.replace(/{{verificationCode}}/g, code)

		await this.mailerService.sendMail({
			to: email,
			subject: 'Подтверждение регистрации на Mellstroy.AI',
			html: finalHtml
		})
	}
}
