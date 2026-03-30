const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0;
};

const parseValidDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

module.exports = {
  isNonEmptyString,
  isPositiveNumber,
  isValidEmail,
  parseValidDate,
};
