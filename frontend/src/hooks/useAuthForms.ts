import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { loginSchema, registerSchema } from '@/data/auth'

import { useAuthMutations, useCountdown, useUrlErrorEffect } from './auth'
import { COUNTDOWN_SECONDS } from '@/data'

export function useAuthForms() {
	const [isRegistration, setIsRegistration] = useState(true)
	const [step, setStep] = useState(0)
	const [direction, setDirection] = useState(1)
	const [emailForVerification, setEmailForVerification] = useState('')
	const [resendMessage, setResendMessage] = useState('')
	const attemptedCode = useRef('')

	const registerForm = useForm({
		resolver: zodResolver(registerSchema),
		mode: 'onTouched',
		defaultValues: {
			email: '',
			password: '',
			confirmPassword: '',
			code: ''
		}
	})
	const loginForm = useForm({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: '', password: '' }
	})
	const forms = useMemo(
		() => ({ registerForm, loginForm }),
		[registerForm, loginForm]
	)

	const rateLimitCountdown = useCountdown({ initialSeconds: 0 })
	const resendCountdown = useCountdown({ initialSeconds: COUNTDOWN_SECONDS })

	useUrlErrorEffect({ forms, rateLimitCountdown })

	const onResendSuccess = () => {
		resendCountdown.start()
		setResendMessage('Новый код успешно отправлен!')
		setTimeout(() => setResendMessage(''), 5000)
	}

	const mutations = useAuthMutations({
		forms,
		rateLimitCountdown,
		onCheckEmailSuccess: email => {
			setEmailForVerification(email)
			setDirection(1)
			setStep(1)
		},
		onRegisterSuccess: () => {
			setDirection(1)
			setStep(2)
			resendCountdown.start()
		},
		onResendSuccess: onResendSuccess
	})

	const handleNextStep = async () => {
		if (step === 0) {
			const isEmailValid = await registerForm.trigger('email')
			if (isEmailValid)
				mutations.onCheckEmailSubmit(registerForm.getValues('email'))
		} else if (step === 1) {
			const arePasswordsValid = await registerForm.trigger([
				'password',
				'confirmPassword'
			])
			if (arePasswordsValid)
				mutations.onRegisterSubmit({ email: emailForVerification })
		}
	}

	const handleConfirmSubmit = useCallback(async () => {
		const isCodeValid = await registerForm.trigger('code')
		if (isCodeValid)
			mutations.onConfirmSubmit({
				email: emailForVerification,
				code: registerForm.getValues('code')
			})
	}, [emailForVerification, registerForm, mutations])

	const codeValue = registerForm.watch('code')
	useEffect(() => {
		if (codeValue?.length !== 6) {
			attemptedCode.current = ''
			return
		}
		if (
			step === 2 &&
			!mutations.isPending &&
			attemptedCode.current !== codeValue
		) {
			attemptedCode.current = codeValue
			handleConfirmSubmit()
		}
	}, [codeValue, step, mutations.isPending, handleConfirmSubmit])

	const handleResendCode = () => {
		if (resendCountdown.isActive || rateLimitCountdown.isActive) return
		mutations.onResendSubmit({ email: emailForVerification })
	}

	const toggleFormType = () => {
		setIsRegistration(prev => !prev)
		setStep(0)
		setEmailForVerification('')
		setResendMessage('')
		forms.registerForm.reset()
		forms.loginForm.reset()
		rateLimitCountdown.reset()
		resendCountdown.reset()
	}

	const handlePrevStep = () => {
		if (step > 0) {
			setDirection(-1)
			setStep(prev => prev - 1)
		}
	}

	return {
		state: {
			isRegistration,
			step,
			direction,
			emailForVerification,
			resendMessage,
			isRateLimitBlocked: rateLimitCountdown.isActive,
			isResendDisabled: resendCountdown.isActive,
			resendCountdownSeconds: resendCountdown.seconds,
			isPending: mutations.isPending,
			isRegisterPending: mutations.isRegisterPending
		},
		forms,
		actions: {
			setStep,
			toggleFormType,
			handleNextStep,
			handlePrevStep,
			handleConfirmSubmit,
			onLoginSubmit: mutations.onLoginSubmit,
			handleResendCode
		}
	}
}
