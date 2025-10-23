import { useFormContext } from 'react-hook-form'

import {
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '@/components/ui/form'
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot
} from '@/components/ui/input-otp'

import { OTP_LENGTH } from '@/data'

interface StepOtpProps {
	isDisabled?: boolean
	emailForVerification: string
}

export function StepOtp({ isDisabled, emailForVerification }: StepOtpProps) {
	const { control } = useFormContext()
	return (
		<div className='flex w-full flex-col items-center text-center'>
			<h2 className='text-2xl font-semibold'>Введите код из письма</h2>
			<p className='dark:text-muted-foreground mt-2 w-80 max-w-xs text-lg text-black/60'>
				Мы отправили проверочный код на адрес{' '}
				<span className='font-medium text-black dark:text-white'>
					{emailForVerification}
				</span>
			</p>
			<FormField
				control={control}
				name='code'
				render={({ field }) => (
					<FormItem className='my-9'>
						<FormControl>
							<InputOTP
								maxLength={OTP_LENGTH}
								{...field}
								disabled={isDisabled}
							>
								<InputOTPGroup>
									{[...Array(OTP_LENGTH)].map((_, index) => (
										<InputOTPSlot
											key={index}
											index={index}
										/>
									))}
								</InputOTPGroup>
							</InputOTP>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</div>
	)
}
