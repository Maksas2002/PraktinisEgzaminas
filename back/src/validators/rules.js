export function isValidName(value) {
  return (
    typeof value === "string" &&
    value.trim().length >= 2 &&
    value.trim().length <= 80
  );
}

export function isValidCourse(value) {
  return Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 6;
}

export function isValidSubjectName(value) {
  return (
    typeof value === "string" &&
    value.trim().length >= 2 &&
    value.trim().length <= 120
  );
}

export function isValidCredits(value) {
  return Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 30;
}

