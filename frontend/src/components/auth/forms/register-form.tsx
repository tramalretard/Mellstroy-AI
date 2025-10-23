import { AnimatePresence, motion } from 'framer-motion'

import { Form } from '@/components/ui/form'

import { RegisterFormProps } from '@/types/auth-types'

import { RegisterFormActions } from './register-form-actions'
import { StepEmail, StepOtp, StepPassword } from './steps'
import { slideVariants } from '@/data'

export function RegisterForm({ form, state, actions }: RegisterFormProps) {
	const isDisabled = state.isPending || state.isRateLimitBlocked

	return (
		<Form {...form}>
			<form
				onSubmit={e => e.preventDefault()}
				className='flex w-full flex-col items-center'
			>
				<div className='relative w-full pt-5'>
					<div
						className='pointer-events-none invisible'
						aria-hidden='true'
					>
						{state.step === 0 && (
							<StepEmail isDisabled={isDisabled} />
						)}
						{state.step === 1 && (
							<StepPassword isDisabled={isDisabled} />
						)}
						{state.step === 2 && (
							<StepOtp
								isDisabled={isDisabled}
								emailForVerification={
									state.emailForVerification
								}
							/>
						)}
					</div>

					<AnimatePresence
						mode='wait'
						custom={state.direction}
						initial={false}
					>
						<motion.div
							key={state.step}
							custom={state.direction}
							variants={slideVariants}
							initial='hidden'
							animate='visible'
							exit='exit'
							className='absolute inset-x-0 top-5'
						>
							{(() => {
								switch (state.step) {
									case 0:
										return (
											<StepEmail
												isDisabled={isDisabled}
											/>
										)
									case 1:
										return (
											<StepPassword
												isDisabled={isDisabled}
											/>
										)
									case 2:
										return (
											<StepOtp
												isDisabled={isDisabled}
												emailForVerification={
													state.emailForVerification
												}
											/>
										)
									default:
										return null
								}
							})()}
						</motion.div>
					</AnimatePresence>
				</div>
				<RegisterFormActions state={state} actions={actions} />
			</form>
		</Form>
	)
}
