/** Convert paise → INR string, e.g. 150000 → "₹1,500.00" */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(paise / 100);
}

/** Convert INR rupees input → paise integer */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/** Convert paise → rupees float */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}
