import axios, { type CreateAxiosDefaults } from 'axios'

const options: CreateAxiosDefaults = {
	baseURL: process.env.NEXT_PUBLIC_API_URL,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true
}

export const api = axios.create(options)

api.interceptors.request.use(config => {
	return config
})

api.interceptors.response.use(
	config => config,
	async error => {
		const originalRequest = error.config

		if (
			error.response.status === 401 &&
			originalRequest &&
			!originalRequest._isRetry &&
			!originalRequest.url.includes('/auth')
		) {
			originalRequest._isRetry = true

			try {
				await api.post('/auth/refresh')

				return api.request(originalRequest)
			} catch (refreshError) {
				console.error(
					'Не удалось обновить токен, пользователю нужно выйти из системы'
				)

				console.log(refreshError)

				return Promise.reject(refreshError)
			}
		}

		throw error
	}
)
