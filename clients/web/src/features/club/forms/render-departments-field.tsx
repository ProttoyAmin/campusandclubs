import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "design/components/ui/combobox";
import {
  Field,
  FieldError,
  FieldLabel,
} from "design/components/ui/field";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  UseFormReturn,
} from "react-hook-form";
import type { ClubCreateSchemaType } from "validation/club";

type props = {
  form: UseFormReturn<ClubCreateSchemaType>;
  field: ControllerRenderProps<ClubCreateSchemaType, "department_templates">;
  fieldState: ControllerFieldState;
  clubTemplatesWithLabel: {
    value: string;
    label: string;
  }[];
};

const RenderDepartmentsComboboxField = (props: props) => {
  const anchor = useComboboxAnchor();
  return (
    <Field data-invalid={props.fieldState.invalid}>
      <FieldLabel>Departments</FieldLabel>
      <div ref={anchor}>
        <Combobox
          multiple
          autoHighlight
          items={props.clubTemplatesWithLabel}
          value={props.field.value ?? []}
          onValueChange={props.field.onChange}
        >
          <ComboboxChips className="min-w-full max-w-xs">
            <ComboboxValue>
              {(values) => (
                <>
                  {values.map((value: string) => {
                    const template = props.clubTemplatesWithLabel.find(
                      (item) => item.value === value,
                    );
                    return (
                      <ComboboxChip key={value}>{template?.label}</ComboboxChip>
                    );
                  })}
                  <ComboboxChipsInput className="min-w-full" />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item.value} value={item.value}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      {props.fieldState.invalid && (
        <FieldError errors={[props.fieldState.error]} />
      )}
    </Field>
  );
};

export default RenderDepartmentsComboboxField;
