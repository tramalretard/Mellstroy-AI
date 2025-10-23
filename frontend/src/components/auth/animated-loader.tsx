'use client'

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface AnimatedLoaderProps {
	className?: string
}

export function AnimatedLoader({ className }: AnimatedLoaderProps) {
	return (
		<div className='flex items-center justify-center'>
			<motion.div
				animate={{ rotate: 360 }}
				transition={{
					repeat: Infinity,
					duration: 1,
					ease: 'linear'
				}}
			>
				<Loader2 className={className} />
			</motion.div>
		</div>
	)
}
