const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯']

// Latin digits -> Bangla digits
export function bn (value: number | string) {
  return String(value).replace(/\d/g, d => BN_DIGITS[Number(d)])
}
