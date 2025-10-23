import { useFormContext } from 'react-hook-form'

import { PasswordField } from '../password-fields'

export function StepPassword({ isDisabled }: { isDisabled?: boolean }) {
	const { control } = useFormContext()
	return (
		<div className='w-full space-y-4'>
			<PasswordField
				name='password'
				placeholder='Введите пароль'
				control={control}
				disabled={isDisabled}
			/>
			<PasswordField
				name='confirmPassword'
				placeholder='Подтвердите пароль'
				control={control}
				disabled={isDisabled}
			/>
		</div>
	)
}
