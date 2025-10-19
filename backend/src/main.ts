import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { getCorsConfig } from './configs'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const config = app.get(ConfigService)
	const logger = new Logger(AppModule.name)

	const host = config.getOrThrow<string>('SERVER_HOST')
	const port = config.getOrThrow<number>('SERVER_PORT')

	app.enableCors(getCorsConfig(config))
	app.useGlobalPipes(new ValidationPipe())
	app.use(cookieParser(config.getOrThrow<string>('COOKIES_SECRET')))

	try {
		await app.listen(4000)

		logger.log(`Сервер успешно запущен на: ${host}`)
	} catch (error) {
		logger.error(
			`Не удалось запустить сервер на порту: ${port} ${error.message}`,
			error
		)
		process.exit(1)
	}
}
bootstrap()
