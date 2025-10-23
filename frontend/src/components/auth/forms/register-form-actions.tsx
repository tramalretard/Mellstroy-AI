import { AnimatePresence, motion } from 'framer-motion'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { RegisterFormActionsProps } from '@/types/auth-types'

import { AnimatedLoader } from '../animated-loader'

export function RegisterFormActions({
	state,
	actions
}: RegisterFormActionsProps) {
	const { formState } = useFormContext()

	return (
		<div className='min-h-[130px] w-full pt-5'>
			{formState.errors.root && (
				<div className='text-destructive mb-4 text-center text-sm font-medium'>
					{formState.errors.root.message}
				</div>
			)}
			<Button
				type='button'
				onClick={
					state.step === 2
						? actions.handleConfirmSubmit
						: actions.handleNextStep
				}
				disabled={state.isPending || state.isRateLimitBlocked}
				size='lg'
				variant='authwhite'
				className='w-full text-xl'
			>
				{state.isPending ? (
					<AnimatedLoader />
				) : state.isRateLimitBlocked ? (
					`${Math.floor(state.rateLimitCountdownSeconds / 60)}:${(
						state.rateLimitCountdownSeconds % 60
					)
						.toString()
						.padStart(2, '0')}`
				) : state.step === 2 ? (
					'Подтвердить'
				) : (
					'Далее'
				)}
			</Button>
			<AnimatePresence>
				{state.step === 2 && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{
							opacity: 1,
							height: 'auto',
							marginTop: '16px'
						}}
						exit={{
							opacity: 0,
							height: 0,
							marginTop: 0
						}}
						className='dark:text-muted-foreground overflow-hidden text-center text-sm text-black/60'
					>
						{!state.resendMessage && (
							<p>Не пришло письмо с кодом?</p>
						)}
						{state.resendMessage && (
							<p className='font-semibold'>
								{state.resendMessage}
							</p>
						)}
						<button
							type='button'
							onClick={actions.handleResendCode}
							disabled={
								state.isRegisterPending ||
								state.isResendDisabled ||
								state.isRateLimitBlocked 
							}
							className={cn(
								'text-foreground pt-1 font-semibold disabled:opacity-50',
								!state.isResendDisabled &&
									!state.isRateLimitBlocked &&
									'cursor-pointer hover:underline'
							)}
						>
							{state.isRegisterPending
								? 'Отправляем...'
								: state.isResendDisabled
									? `Отправить через ${state.resendCountdownSeconds} с.`
									: state.isRateLimitBlocked
										? `Подождите ${state.rateLimitCountdownSeconds} с.`
										: 'Отправить еще раз'}
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	)
}