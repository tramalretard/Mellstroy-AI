import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PasswordFieldProps {
	name: 'password' | 'confirmPassword';
	placeholder: string;
	control: Control<any>;
	disabled?: boolean;
}

export function PasswordField({ name, placeholder, control, disabled }: PasswordFieldProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<div className='relative'>
						<FormControl>
							<Input
								placeholder={placeholder}
								type={showPassword ? 'text' : 'password'}
								disabled={disabled}
								{...field}
							/>
						</FormControl>
						<div
							className='text-foreground/50 absolute inset-y-0 right-0 flex cursor-pointer items-center p-2'
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? <Eye /> : <EyeOff />}
						</div>
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}