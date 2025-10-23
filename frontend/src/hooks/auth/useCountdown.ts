import { useCallback, useEffect, useState } from 'react'

interface CountdownOptions {
	initialSeconds: number
	onEnd?: () => void
}

export function useCountdown({ initialSeconds, onEnd }: CountdownOptions) {
	const [seconds, setSeconds] = useState(0)
	const [isActive, setIsActive] = useState(false)

	useEffect(() => {
		if (!isActive || seconds <= 0) {
			if (isActive && seconds <= 0) {
				setIsActive(false)
				onEnd?.()
			}
			return
		}

		const timer = setInterval(() => {
			setSeconds(prev => prev - 1)
		}, 1000)

		return () => clearInterval(timer)
	}, [isActive, seconds, onEnd])

	const start = useCallback(
		(customSeconds?: number) => {
			setSeconds(customSeconds ?? initialSeconds)
			setIsActive(true)
		},
		[initialSeconds]
	)

	const stop = useCallback(() => {
		setIsActive(false)
	}, [])

	const reset = useCallback(() => {
		setIsActive(false)
		setSeconds(0)
	}, [])

	return {
		seconds,
		isActive,
		start,
		stop,
		reset
	}
}
