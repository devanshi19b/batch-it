export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const relativeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export const formatCurrency = (value) =>
  currencyFormatter.format(Number(value) || 0);

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export const getTimeRemaining = (value) => {
  const diff = new Date(value).getTime() - Date.now();

  if (Number.isNaN(diff)) {
    return { label: "Unknown", isExpired: false };
  }

  if (diff <= 0) {
    return { label: "Expired", isExpired: true };
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);

  if (hours >= 1) {
    const remainder = minutes % 60;
    return {
      label: `${hours}h ${remainder.toString().padStart(2, "0")}m left`,
      isExpired: false,
    };
  }

  return { label: `${minutes}m left`, isExpired: false };
};

export const formatRelativeTime = (value) => {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return "just now";
  }

  const diffMinutes = Math.round((timestamp - Date.now()) / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour");
  }

  return relativeFormatter.format(Math.round(diffHours / 24), "day");
};

export const toDateTimeLocalValue = (value) => {
  const date = value ? new Date(value) : new Date(Date.now() + 45 * 60 * 1000);
  const offset = date.getTimezoneOffset();
  const normalized = new Date(date.getTime() - offset * 60000);
  return normalized.toISOString().slice(0, 16);
};
