import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

interface UrlErrorEffectProps {
	forms: {
		loginForm: UseFormReturn<any>
		registerForm: UseFormReturn<any>
	}
	rateLimitCountdown: {
		start: (seconds: number) => void
	}
}

export function useUrlErrorEffect({ forms, rateLimitCountdown }: UrlErrorEffectProps) {
	const searchParams = useSearchParams()
	const router = useRouter()

	useEffect(() => {
		const errorType = searchParams.get('error')
		const message = searchParams.get('message')
		const cooldown = searchParams.get('cooldown')

		if (errorType === 'rate_limit' && message && cooldown) {
			const cooldownSeconds = parseInt(cooldown, 10)
			if (!isNaN(cooldownSeconds)) {
				const errorMessage = decodeURIComponent(message)
				forms.registerForm.setError('root', { message: errorMessage })
				forms.loginForm.setError('root', { message: errorMessage })
				rateLimitCountdown.start(cooldownSeconds)

				router.replace(window.location.pathname, { scroll: false })
			}
		}
	}, [searchParams, forms, rateLimitCountdown, router])
}
