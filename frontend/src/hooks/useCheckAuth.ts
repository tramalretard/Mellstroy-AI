import { useQuery } from '@tanstack/react-query'

import { checkAuth } from '@/api/requests'

export function useCheckAuth() {
	const { data, isLoading, isError, isSuccess } = useQuery({
		queryKey: ['checkAuth'],
		queryFn: checkAuth,
		retry: 0,
		refetchOnWindowFocus: false
	})

	const isAuthorized = isSuccess && !!data

	return {
		user: data,
		isAuthorized,
		isLoadingAuth: isLoading
	}
}
