import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { LoginFormProps } from '@/types/auth-types'

import { AnimatedLoader } from '../animated-loader'

import { PasswordField } from './password-fields'

export function LoginForm({ form, state, actions }: LoginFormProps) {
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(actions.onLoginSubmit)}
				className='w-full space-y-4 pt-10'
			>
				<FormField
					control={form.control}
					name='email'
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Input
									placeholder='Введите электронную почту'
									disabled={
										state.isPending ||
										state.isRateLimitBlocked
									}
									{...{ ...field, value: field.value || '' }}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<PasswordField
					name='password'
					placeholder='Введите пароль'
					control={form.control}
					disabled={state.isPending || state.isRateLimitBlocked}
				/>
				{form.formState.errors.root && (
					<div className='text-destructive text-center text-sm font-medium'>
						{form.formState.errors.root.message}
					</div>
				)}
				<Button
					type='submit'
					disabled={state.isPending || state.isRateLimitBlocked}
					size='lg'
					variant='authwhite'
					className='w-full text-xl'
				>
					{state.isPending ? <AnimatedLoader /> : 'Войти'}
				</Button>
			</form>
		</Form>
	)
}
