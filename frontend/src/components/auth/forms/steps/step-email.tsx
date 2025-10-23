import { useFormContext } from 'react-hook-form'

import {
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

export function StepEmail({ isDisabled }: { isDisabled?: boolean }) {
	const { control } = useFormContext()
	return (
		<FormField
			control={control}
			name='email'
			render={({ field }) => (
				<FormItem>
					<FormControl>
						<Input
							placeholder='Введите электронную почту'
							disabled={isDisabled}
							{...field}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	)
}
