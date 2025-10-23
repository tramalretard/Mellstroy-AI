import { useAuthForms } from "@/hooks"

export type UseAuthFormsReturn = ReturnType<typeof useAuthForms>

export interface LoginFormProps {
	form: UseAuthFormsReturn['forms']['loginForm']
	state: UseAuthFormsReturn['state']
	actions: UseAuthFormsReturn['actions']
}

export interface RegisterFormProps {
	form: UseAuthFormsReturn['forms']['registerForm']
	state: UseAuthFormsReturn['state']
	actions: UseAuthFormsReturn['actions']
}

export interface RegisterFormActionsProps {
	state: UseAuthFormsReturn['state']
	actions: UseAuthFormsReturn['actions']
}
