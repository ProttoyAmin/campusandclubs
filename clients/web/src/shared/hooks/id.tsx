import { useId } from "react";
import { generateId } from "@/utils/id";

export const useComponentId = (prefix?: string, suffix?: string): string => {
  const reactId = useId();

  const cleanId = reactId.replace(/[:]/g, "");

  let id = cleanId;
  if (prefix) id = `${prefix}-${id}`;
  if (suffix) id = `${id}-${suffix}`;

  return id;
};

export const useSectionId = (
  prefix: string = "section-id-",
  length: number = 12,
): string => {
  return generateId(prefix, length);
};

export const useFieldId = (
  fieldName: string,
  prefix: string = "field",
): string => {
  return useComponentId(prefix, fieldName);
};

export const useInstanceId = (componentName: string): string => {
  return useComponentId(componentName, "instance");
};
