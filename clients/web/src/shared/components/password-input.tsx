import { EyeIcon, EyeOffIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { Input } from 'design/components/ui/input'
import React from 'react'
import type { ControllerFieldState, ControllerRenderProps } from 'react-hook-form'

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const PasswordInput = ({ field, fieldState, props }: {
  field: ControllerRenderProps<any>, fieldState: ControllerFieldState, props?: InputProps
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className='relative w-full'>
      <Input
        {...field}
        id="password"
        type={showPassword ? "text" : "password"}
        aria-invalid={fieldState.invalid}
        placeholder={props?.placeholder ?? "Password"}
        autoComplete={props?.autoComplete ?? "off"}
        className="w-full pr-10"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none max-w-6"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} className="size-4 mx-auto" />

      </button>
    </div>
  )
}

export default PasswordInput