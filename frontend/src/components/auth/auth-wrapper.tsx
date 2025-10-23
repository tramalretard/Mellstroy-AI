'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { type ReactNode } from 'react'

import { Button } from '../ui/button'

import { handleGoogleLogin } from '@/data'

interface AuthWrapperProps {
	children: ReactNode
	isRegistration: boolean
	step: number
	onToggleType: () => void
	setStep: (step: number) => void
	onPrev: () => void
}

export function AuthWrapper({
	children,
	isRegistration,
	onToggleType,
	step,
	setStep,
	onPrev
}: AuthWrapperProps) {
	const totalSteps = 3

	return (
		<div className='relative mx-auto flex min-h-screen items-center justify-center overflow-hidden'>
			<video
				src='/videos/auth-bg-light-video.mp4'
				autoPlay
				loop
				muted
				playsInline
				className='absolute inset-0 h-full w-full object-cover blur-xl dark:hidden'
			/>

			<video
				src='/videos/auth-bg-dark-video.mp4'
				autoPlay
				loop
				muted
				playsInline
				className='absolute inset-0 hidden h-full w-full object-cover blur-xl dark:block'
			/>

			<div className='absolute inset-0 z-1 bg-white/10 dark:bg-black/25'></div>

			<motion.div
				layout
				transition={{
					type: 'tween',
					stiffness: 300,
					damping: 40
				}}
				className='dark:bg-background/10 border-foreground/20 bg-background/10 shadow-foreground/20 dark:shadow-foreground/5 relative z-10 w-[480px] rounded-4xl border p-12 shadow-2xl backdrop-blur-xs'
			>
				<div className='flex flex-col items-center justify-center'>
					<div className='relative mb-3 flex h-14 w-full items-center justify-center'>
						<p className='bg-gradient-to-r from-[#C74AD4] to-[#3E5EEA] bg-clip-text pb-1 text-[42px] font-bold text-transparent'>
							MELLSTROY.AI
						</p>
					</div>

					<motion.div layout className='min-w-[330px]'>
						{children}
					</motion.div>

					{isRegistration && (
						<div className='text-foreground/50 relative flex w-[330px] items-center justify-center pt-6'>
							<AnimatePresence>
								{step > 0 && (
									<motion.button
										initial={{ opacity: 0, scale: 0.5 }}
										animate={{ opacity: 1, scale: 1 }}
										exit={{ opacity: 0, scale: 0.5 }}
										onClick={onPrev}
										className='absolute left-0 cursor-pointer'
									>
										<ArrowLeft className='h-6 w-6' />
									</motion.button>
								)}
							</AnimatePresence>

							<div className='flex items-center justify-center space-x-2'>
								{Array.from({
									length: totalSteps
								}).map((_, index) => (
									<button
										key={index}
										onClick={() =>
											step > index && setStep(index)
										}
										className={`h-2 w-2 rounded-full transition-colors ${
											step === index
												? 'bg-foreground'
												: 'bg-foreground/30'
										} ${step > index ? 'cursor-pointer' : 'cursor-default'}`}
									/>
								))}
							</div>
						</div>
					)}

					<AnimatePresence>
						{step === 0 && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{
									opacity: 1,
									height: 'auto',
									marginTop: '12px'
								}}
								exit={{ opacity: 0, height: 0, marginTop: 0 }}
								transition={{
									duration: 0.4,
									ease: 'easeInOut'
								}}
								className='flex max-h-[130px] w-[330px] flex-col items-center overflow-hidden'
							>
								<p className='dark:text-muted-foreground text-center text-base font-normal text-black/60'>
									{isRegistration
										? 'Есть аккаунт?'
										: 'Нет аккаунта?'}{' '}
									<button
										type='button'
										onClick={onToggleType}
										className='text-foreground cursor-pointer font-medium hover:underline focus:outline-none'
									>
										{isRegistration
											? 'Вход'
											: 'Регистрация'}
									</button>
								</p>

								<div className='my-3 flex w-full items-center'>
									<div className='border-0.5 border-muted-foreground flex-grow border-t'></div>
									<span className='text-muted-foreground mx-4 text-sm'>
										или
									</span>
									<div className='border-0.5 border-muted-foreground flex-grow border-t'></div>
								</div>

								<Button
									className='relative mb-4 h-12 w-full text-base font-normal'
									variant='outline'
									onClick={handleGoogleLogin}
								>
									<div className='absolute left-4'>
										<Image
											src='/icons/google-icon.svg'
											alt='Google'
											width={20}
											height={20}
										/>
									</div>
									<span>Вход через Google</span>
								</Button>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</motion.div>
		</div>
	)
}
