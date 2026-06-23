import { body, param } from "express-validator";
import { isValidCredits, isValidSubjectName } from "./rules.js";

export const assignmentIdParam = [
  param("assignmentId")
    .isInt({ min: 1 })
    .withMessage("Dalyko įrašo ID turi būti teigiamas sveikasis skaičius."),
];

export const subjectBody = [
  body("name")
    .custom(isValidSubjectName)
    .withMessage("Dalyko pavadinimą turi sudaryti 2–120 simbolių."),
  body("credits")
    .custom(isValidCredits)
    .withMessage("Kreditų skaičius turi būti sveikasis skaičius nuo 1 iki 30."),
];

