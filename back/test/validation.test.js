import test from "node:test";
import assert from "node:assert/strict";
import {
  isValidCourse,
  isValidCredits,
  isValidName,
  isValidSubjectName,
} from "../src/validators/rules.js";

test("studento vardas validuojamas", () => {
  assert.equal(isValidName("Jonas"), true);
  assert.equal(isValidName("J"), false);
  assert.equal(isValidName(""), false);
});

test("kursas turi būti nuo 1 iki 6", () => {
  assert.equal(isValidCourse(1), true);
  assert.equal(isValidCourse("6"), true);
  assert.equal(isValidCourse(0), false);
  assert.equal(isValidCourse(7), false);
  assert.equal(isValidCourse(2.5), false);
});

test("dalyko pavadinimas validuojamas", () => {
  assert.equal(isValidSubjectName("JavaScript programavimas"), true);
  assert.equal(isValidSubjectName("A"), false);
});

test("kreditai turi būti nuo 1 iki 30", () => {
  assert.equal(isValidCredits(6), true);
  assert.equal(isValidCredits("30"), true);
  assert.equal(isValidCredits(0), false);
  assert.equal(isValidCredits(31), false);
});

