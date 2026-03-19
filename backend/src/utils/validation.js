const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isPositiveNumber = (value) => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) && parsedValue > 0;
};

const parseValidDate = (value) => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

module.exports = {
  isNonEmptyString,
  isPositiveNumber,
  isValidEmail,
  parseValidDate,
};
