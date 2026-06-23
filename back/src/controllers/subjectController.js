import {
  createSubject,
  editSubject,
  getSubject,
  listSubjects,
  removeSubject,
} from "../services/subjectService.js";

export async function getSubjects(req, res, next) {
  try {
    const subjects = await listSubjects(Number(req.params.studentId));
    res.status(200).json({ data: subjects, count: subjects.length });
  } catch (error) {
    next(error);
  }
}

export async function getSubjectById(req, res, next) {
  try {
    res.status(200).json({
      data: await getSubject(
        Number(req.params.studentId),
        Number(req.params.assignmentId),
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function postSubject(req, res, next) {
  try {
    res.status(201).json({
      data: await createSubject(Number(req.params.studentId), req.body),
    });
  } catch (error) {
    next(error);
  }
}

export async function putSubject(req, res, next) {
  try {
    res.status(200).json({
      data: await editSubject(
        Number(req.params.studentId),
        Number(req.params.assignmentId),
        req.body,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSubject(req, res, next) {
  try {
    await removeSubject(
      Number(req.params.studentId),
      Number(req.params.assignmentId),
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

