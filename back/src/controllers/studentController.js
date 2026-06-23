import {
  createStudent,
  editStudent,
  getStudent,
  listStudents,
  removeStudent,
} from "../services/studentService.js";

export async function getStudents(req, res, next) {
  try {
    const students = await listStudents(req.query);
    res.status(200).json({ data: students, count: students.length });
  } catch (error) {
    next(error);
  }
}

export async function getStudentById(req, res, next) {
  try {
    res.status(200).json({ data: await getStudent(Number(req.params.id)) });
  } catch (error) {
    next(error);
  }
}

export async function postStudent(req, res, next) {
  try {
    res.status(201).json({ data: await createStudent(req.body) });
  } catch (error) {
    next(error);
  }
}

export async function putStudent(req, res, next) {
  try {
    res.status(200).json({
      data: await editStudent(Number(req.params.id), req.body),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteStudent(req, res, next) {
  try {
    await removeStudent(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

