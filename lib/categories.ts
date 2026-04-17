export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Investment",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
