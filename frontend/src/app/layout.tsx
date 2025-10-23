import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'

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
				</ThemeProvider>
			</body>
		</html>
	)
}
