import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Global()
@Module({
	providers: [
		{
			provide: 'REDIS_CLIENT',
			useFactory: (configService: ConfigService) => {
				const redisUrl = configService.getOrThrow<string>('REDIS_URL')
				return new Redis(redisUrl)
			},
			inject: [ConfigService]
		}
	],
	exports: ['REDIS_CLIENT']
})
export class RedisModule {}
