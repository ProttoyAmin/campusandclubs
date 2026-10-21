export const formatLabel = (value: string) =>
    value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");