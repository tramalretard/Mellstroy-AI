export interface AuthRequest {
	email: string
	password: string
	username: string
}

export interface ConfirmEmailRequest {
	email: string
	code: string
}
