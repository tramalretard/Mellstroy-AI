// api/requests/index.ts
import { api } from '../instance'
import type { IUser } from '../types'
import { AuthRequest, ConfirmEmailRequest } from '../types/authRequest'

export const register = async (data: AuthRequest) => {
	const res = await api.post<{ message: string }>('/auth/register', data)
	return res.data
}

export const confirmEmail = async (data: ConfirmEmailRequest) => {
	const res = await api.post<IUser>('/auth/confirm', data)
	return res.data
}

export const checkEmail = async (data: { email: string }) => {
	const res = await api.post('/auth/check-email', data)
	return res.data
}

export const login = async (data: Omit<AuthRequest, 'username'>) => {
	const res = await api.post<IUser>('/auth/login', data)
	return res.data
}

export const logout = async () => {
	await api.post('/auth/logout')
}

export const checkAuth = async () => {
	const res = await api.get<IUser>('/user/me')
	return res.data
}
