import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/auth']

const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const refreshToken = request.cookies.get('refreshToken')?.value

	if (!CLIENT_URL) {
		throw new Error(
			'Переменная окружения NEXT_PUBLIC_CLIENT_URL не найдена'
		)
	}

	if (refreshToken) {
		if (publicRoutes.includes(pathname)) {
			return NextResponse.redirect(new URL(CLIENT_URL, request.url))
		}
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
