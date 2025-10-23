import { type Variants } from 'framer-motion'

export const slideVariants: Variants = {
	hidden: direction => ({
		x: direction > 0 ? '15%' : '-15%',
		opacity: 0,
		position: 'absolute'
	}),
	visible: {
		x: 0,
		opacity: 1,
		position: 'absolute',
		transition: { duration: 0.3, ease: 'easeInOut' }
	},
	exit: direction => ({
		x: direction < 0 ? '15%' : '-15%',
		opacity: 0,
		position: 'absolute',
		transition: { duration: 0.3, ease: 'easeInOut' }
	})
}
