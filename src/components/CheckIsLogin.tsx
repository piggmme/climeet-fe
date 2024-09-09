import { useIsLogin } from '@/services/user'
import { PropsWithChildren, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

type Props = {
  redirect?: '/login' | '/home'
} & PropsWithChildren

export default function CheckIsLogin ({ redirect = '/login' }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  const { data: isLogin, isLoading } = useIsLogin()

  useEffect(
    function GoLogin () {
      if (isLoading) return
      if (!isLogin && redirect)
        navigate(`${redirect}?redirect=${location.pathname}`, { replace: true })
    },
    [isLoading, isLogin, redirect],
  )

  return (
    <ErrorBoundary fallback={<>로그인 확인중 ...</>}>
      <Outlet />
    </ErrorBoundary>
  )
}
