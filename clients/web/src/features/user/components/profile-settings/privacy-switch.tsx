import { Switch } from "design/components/ui/switch"

const PrivacySwitch = () => {
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor="privacy-switch" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-75">
        Private Profile
      </label>
      <Switch id="privacy-switch"/>
    </div>
  )
}

export default PrivacySwitch