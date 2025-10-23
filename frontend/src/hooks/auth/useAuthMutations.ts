import { useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'

import {
	useCheckEmailMutation,
	useConfirmEmailMutation,
	useLoginMutation,
	useRegisterMutation
} from '@/api/hooks'

interface AuthMutationsProps {
	forms: {
		loginForm: UseFormReturn<any>
		registerForm: UseFormReturn<any>
	}
	rateLimitCountdown: {
		start: (seconds?: number) => void
	}
	onCheckEmailSuccess: (email: string) => void
	onRegisterSuccess: () => void
	onResendSuccess: () => void
}

export function useAuthMutations({
	forms,
	rateLimitCountdown,
	onCheckEmailSuccess,
	onRegisterSuccess,
	onResendSuccess
}: AuthMutationsProps) {
	const { loginForm, registerForm } = forms

	const { mutate: login, isPending: isLoginPending } = useLoginMutation()
	const { mutate: register, isPending: isRegisterPending } =
		useRegisterMutation()
	const { mutate: checkEmail, isPending: isCheckingEmail } =
		useCheckEmailMutation()
	const { mutate: confirmEmail, isPending: isConfirmPending } =
		useConfirmEmailMutation()
	const { mutate: resend, isPending: isResending } = useRegisterMutation()

	const isPending =
		isLoginPending ||
		isRegisterPending ||
		isCheckingEmail ||
		isConfirmPending

	const handleApiError = useCallback(
		(error: any, form: UseFormReturn<any>, fieldName: string = 'root') => {
			const errorData = error.response?.data
			const status = error.response?.status
			const cooldownSeconds = errorData?.cooldown
			const message =
				typeof errorData === 'object' && errorData.message
					? errorData.message
					: errorData || 'Произошла неизвестная ошибка'

			if (status === 400 && cooldownSeconds) {
				rateLimitCountdown.start(cooldownSeconds)
				form.setError('root', { message })
			} else {
				form.setError(fieldName, { type: 'manual', message })
			}
		},
		[rateLimitCountdown]
	)

	const onLoginSubmit = (values: any) => {
		loginForm.clearErrors('root')
		login(values, {
			onSuccess: () => (window.location.href = '/'),
			onError: error => handleApiError(error, loginForm, 'root')
		})
	}

	const onCheckEmailSubmit = (email: string) => {
		checkEmail(
			{ email },
			{
				onSuccess: () => onCheckEmailSuccess(email),
				onError: error => handleApiError(error, registerForm, 'email')
			}
		)
	}

	const onRegisterSubmit = (data: { email: string; password?: string }) => {
		const password = data.password || registerForm.getValues('password')
		const username = data.email.split('@')[0]

		register(
			{ email: data.email, password, username },
			{
				onSuccess: () => onRegisterSuccess(),
				onError: error => handleApiError(error, registerForm, 'root')
			}
		)
	}

	const onResendSubmit = (data: { email: string }) => {
		const password = registerForm.getValues('password')
		const username = data.email.split('@')[0]

		register(
			{ email: data.email, password, username },
			{
				onSuccess: () => onResendSuccess(),
				onError: error => handleApiError(error, registerForm, 'root')
			}
		)
	}

	const onConfirmSubmit = (data: { email: string; code: string }) => {
		confirmEmail(data, {
			onSuccess: () => (window.location.href = '/'),
			onError: error => handleApiError(error, registerForm, 'code')
		})
	}

	return {
		isPending,
		isResending,
		isRegisterPending,
		onLoginSubmit,
		onCheckEmailSubmit,
		onRegisterSubmit,
		onResendSubmit,
		onConfirmSubmit
	}
}
