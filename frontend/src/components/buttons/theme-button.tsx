'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface ButtonToggleThemeProps {
	className?: string
}

export function ThemeButton({ className }: ButtonToggleThemeProps) {
	const { setTheme, resolvedTheme } = useTheme()

	const toggleTheme = () => {
		if (resolvedTheme === 'dark') {
			setTheme('light')
		} else {
			setTheme('dark')
		}
	}

	return (
		<Button
			variant='outline'
			size='icon'
			onClick={toggleTheme}
			className={cn(className)}
		>
			<Sun className='h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
			<Moon className='absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
			<span className='sr-only'>Сменить тему</span>
		</Button>
	)
}
