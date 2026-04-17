export const INCOME_TYPES = ["Salary", "Freelance", "Bonus", "Profit", "Other"] as const;
export type IncomeType = (typeof INCOME_TYPES)[number];
