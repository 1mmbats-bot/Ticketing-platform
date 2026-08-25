export const CATEGORIES = [
  "music",
  "sports",
  "theater",
  "conference",
  "comedy",
  "general",
];

// Payment platforms shown at checkout. `refLabel` is the label for the
// reference field; `instructions` is shown once the method is picked.
export const PAYMENT_METHODS = [
  {
    value: "mpesa",
    label: "M-Pesa",
    icon: "📱",
    refLabel: "M-Pesa phone number",
    placeholder: "+2547XXXXXXXX",
    instructions:
      "After ordering you'll get an M-Pesa prompt (or send to Paybill and enter the code). Your ticket is reserved as 'pending' until payment is confirmed.",
  },
  {
    value: "airtel",
    label: "Airtel Money",
    icon: "📲",
    refLabel: "Airtel Money phone number",
    placeholder: "+2547XXXXXXXX",
    instructions:
      "Pay via Airtel Money to the merchant number. Enter the phone you'll pay from.",
  },
  {
    value: "card",
    label: "Credit / Debit Card",
    icon: "💳",
    refLabel: "Cardholder name",
    placeholder: "Name on card",
    instructions:
      "Card charging happens through your card processor. For now we record your order and mark it pending — do NOT enter full card numbers here.",
  },
  {
    value: "paypal",
    label: "PayPal",
    icon: "🅿️",
    refLabel: "PayPal email",
    placeholder: "you@paypal.com",
    instructions:
      "Send payment to the organizer's PayPal, then enter the PayPal email you paid from.",
  },
  {
    value: "bank",
    label: "Bank Transfer",
    icon: "🏦",
    refLabel: "Bank reference / txn code",
    placeholder: "Transfer reference",
    instructions:
      "Transfer to the organizer's bank account and enter the transaction reference.",
  },
];

export function paymentLabel(value) {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label || value;
}

export function formatMoney(cents) {
  return (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateShort(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// datetime-local input needs "YYYY-MM-DDTHH:mm"
export function toDatetimeLocal(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
