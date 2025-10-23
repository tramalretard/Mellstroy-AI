export const handleGoogleLogin = () => {
	const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
	window.location.href = url
}
