import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "design/components/ui/field"
import { Switch } from "design/components/ui/switch"

const PrivacySwitch = ({ isPrivate, setIsPrivate }: { isPrivate: boolean, setIsPrivate: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <Field orientation="horizontal">
      <FieldContent className="w-full">
        <FieldLabel htmlFor="switch-focus-mode" className="font-semibold text-md">
          Private Profile
        </FieldLabel>
        <FieldDescription className="text-sm">
          When your profile is private, only followers can see and interact with your posts. Your replies will be visible to followers and individual profiles you reply to and you will receive message requests from people you don't follow.
        </FieldDescription>
      </FieldContent>
      <Switch
        id="switch-focus-mode"
        checked={isPrivate}
        onCheckedChange={setIsPrivate}
      />
    </Field>
  )
}

export default PrivacySwitch