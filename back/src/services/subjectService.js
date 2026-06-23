import { AppError } from "../middleware/AppError.js";
import { findStudentById } from "../repositories/studentRepository.js";
import {
  deleteStudentSubject,
  findStudentSubjectById,
  findStudentSubjects,
  insertStudentSubject,
  updateStudentSubject,
} from "../repositories/subjectRepository.js";

async function ensureStudent(studentId) {
  if (!(await findStudentById(studentId))) {
    throw new AppError("Studentas nerastas.", 404);
  }
}

export async function listSubjects(studentId) {
  await ensureStudent(studentId);
  return findStudentSubjects(studentId);
}

export async function getSubject(studentId, assignmentId) {
  await ensureStudent(studentId);
  const subject = await findStudentSubjectById(studentId, assignmentId);
  if (!subject) throw new AppError("Studentui priskirtas dalykas nerastas.", 404);
  return subject;
}

export async function createSubject(studentId, data) {
  await ensureStudent(studentId);
  try {
    return await insertStudentSubject(studentId, data);
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("Toks dalykas studentui jau priskirtas.", 409);
    }
    throw error;
  }
}

export async function editSubject(studentId, assignmentId, data) {
  await ensureStudent(studentId);
  try {
    const subject = await updateStudentSubject(studentId, assignmentId, data);
    if (!subject) throw new AppError("Studentui priskirtas dalykas nerastas.", 404);
    return subject;
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("Toks dalykas studentui jau priskirtas.", 409);
    }
    throw error;
  }
}

export async function removeSubject(studentId, assignmentId) {
  await ensureStudent(studentId);
  const subject = await deleteStudentSubject(studentId, assignmentId);
  if (!subject) throw new AppError("Studentui priskirtas dalykas nerastas.", 404);
}

