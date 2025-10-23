import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'

import { ThemeButton } from '@/components/buttons/theme-button'

import './globals.css'
import { QueryProvider, ThemeProvider } from '@/providers'

const montserrat = Montserrat({
	subsets: ['latin']
})

export const metadata: Metadata = {
	title: 'Mellstroy AI',
	description: 'Нейросеть Mellstroy'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='ru' suppressHydrationWarning>
			<body className={`${montserrat.className} antialiased`}>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<QueryProvider>{children}</QueryProvider>
					<ThemeButton className='absolute top-10 right-10 z-30' />
				</ThemeProvider>
			</body>
		</html>
	)
}
