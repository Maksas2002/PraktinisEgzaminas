import { AppError } from "../middleware/AppError.js";
import {
  deleteStudentById,
  findStudentById,
  findStudents,
  insertStudent,
  updateStudentById,
} from "../repositories/studentRepository.js";
import { findStudentSubjects } from "../repositories/subjectRepository.js";

export const listStudents = (filters) => findStudents(filters);

export async function getStudent(id) {
  const student = await findStudentById(id);
  if (!student) throw new AppError("Studentas nerastas.", 404);
  const subjects = await findStudentSubjects(id);
  return { ...student, subjects };
}

export const createStudent = (data) => insertStudent(data);

export async function editStudent(id, data) {
  const student = await updateStudentById(id, data);
  if (!student) throw new AppError("Studentas nerastas.", 404);
  const subjects = await findStudentSubjects(id);
  return { ...student, subjectCount: subjects.length, subjects };
}

export async function removeStudent(id) {
  const student = await deleteStudentById(id);
  if (!student) throw new AppError("Studentas nerastas.", 404);
  return student;
}

