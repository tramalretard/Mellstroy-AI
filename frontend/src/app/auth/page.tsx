import type { Metadata } from 'next'

import { AuthForms } from '@/components/auth/auth-forms'

export const metadata: Metadata = {
	title: 'Авторизация'
}

export default function AuthPage() {
	return <AuthForms />
}
