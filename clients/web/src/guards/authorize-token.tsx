import React from 'react';
import { authentication } from '@/features/auth/services/authentication';

const AuthorizeRequest = ({children} : {children: React.ReactNode}): React.ReactNode => {
    React.useEffect(() => {
        authentication.init();
    }, [])
  return (
    <>{children}</>
  )
}

export default AuthorizeRequest;