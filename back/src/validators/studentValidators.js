import { body, param, query } from "express-validator";
import { isValidCourse, isValidName } from "./rules.js";

export const idParam = [
  param("id").isInt({ min: 1 }).withMessage("ID turi būti teigiamas sveikasis skaičius."),
];

export const studentIdParam = [
  param("studentId")
    .isInt({ min: 1 })
    .withMessage("Studento ID turi būti teigiamas sveikasis skaičius."),
];

export const studentFilters = [
  query("course")
    .optional({ values: "falsy" })
    .custom(isValidCourse)
    .withMessage("Kursas turi būti sveikasis skaičius nuo 1 iki 6."),
  query("id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("ID turi būti teigiamas sveikasis skaičius."),
  query("firstName")
    .optional({ values: "falsy" })
    .isLength({ max: 80 })
    .withMessage("Vardas negali būti ilgesnis nei 80 simbolių."),
  query("lastName")
    .optional({ values: "falsy" })
    .isLength({ max: 80 })
    .withMessage("Pavardė negali būti ilgesnė nei 80 simbolių."),
];

export const studentBody = [
  body("firstName")
    .custom(isValidName)
    .withMessage("Vardą turi sudaryti 2–80 simbolių."),
  body("lastName")
    .custom(isValidName)
    .withMessage("Pavardę turi sudaryti 2–80 simbolių."),
  body("course")
    .custom(isValidCourse)
    .withMessage("Kursas turi būti sveikasis skaičius nuo 1 iki 6."),
];

