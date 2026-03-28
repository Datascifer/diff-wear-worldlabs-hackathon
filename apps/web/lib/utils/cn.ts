// Class name utility — dependency-free
export function cn(
  ...inputs: (string | undefined | null | false)[]
): string {
  return inputs
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ");
}
