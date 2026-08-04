import React from 'react'
import { Link } from 'react-router'

const SignInPage = () => {
  return (
    <div>
        <h1>SignInPage</h1>
        <Link to={{
            pathname: '/@/auth/sign-up',
        }}> Sign up</Link>
    </div>
  )
}

export default SignInPage