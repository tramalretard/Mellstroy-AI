import { type UseMutationOptions, useMutation } from '@tanstack/react-query'

import { checkEmail, confirmEmail, login, register } from '../requests'
import { IUser } from '../types'
import { AuthRequest, ConfirmEmailRequest } from '../types/authRequest'

export function useLoginMutation(
	options?: Omit<
		UseMutationOptions<IUser, unknown, Omit<AuthRequest, 'username'>>,
		'mutationKey' | 'mutationFn'
	>
) {
	return useMutation({
		mutationKey: ['login'],
		mutationFn: (data: Omit<AuthRequest, 'username'>) => login(data),
		...options
	})
}

export function useRegisterMutation(
	options?: Omit<
		UseMutationOptions<{ message: string }, unknown, AuthRequest>,
		'mutationKey' | 'mutationFn'
	>
) {
	return useMutation({
		mutationKey: ['register'],
		mutationFn: (data: AuthRequest) => register(data),
		...options
	})
}

export function useCheckEmailMutation(
	options?: UseMutationOptions<
		{ message: string },
		unknown,
		{ email: string }
	>
) {
	return useMutation({
		mutationKey: ['checkEmail'],
		mutationFn: (data: { email: string }) => checkEmail(data),
		...options
	})
}

export function useConfirmEmailMutation(
	options?: Omit<
		UseMutationOptions<IUser, unknown, ConfirmEmailRequest>,
		'mutationKey' | 'mutationFn'
	>
) {
	return useMutation({
		mutationKey: ['confirmEmail'],
		mutationFn: (data: ConfirmEmailRequest) => confirmEmail(data),
		...options
	})
}
