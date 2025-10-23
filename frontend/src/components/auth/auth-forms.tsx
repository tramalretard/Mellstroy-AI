'use client'

import { AuthWrapper } from './auth-wrapper'
import { LoginForm, RegisterForm } from './forms'
import { useAuthForms } from '@/hooks'

export function AuthForms() {
	const { state, forms, actions } = useAuthForms()

	return (
		<AuthWrapper
			isRegistration={state.isRegistration}
			onToggleType={actions.toggleFormType}
			step={state.step}
			setStep={actions.setStep}
			onPrev={actions.handlePrevStep}
		>
			{state.isRegistration ? (
				<RegisterForm
					form={forms.registerForm}
					state={state}
					actions={actions}
				/>
			) : (
				<LoginForm
					form={forms.loginForm}
					state={state}
					actions={actions}
				/>
			)}
		</AuthWrapper>
	)
}
