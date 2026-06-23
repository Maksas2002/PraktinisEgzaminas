import { Router } from "express";
import {
  deleteSubject,
  getSubjectById,
  getSubjects,
  postSubject,
  putSubject,
} from "../controllers/subjectController.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { studentIdParam } from "../validators/studentValidators.js";
import {
  assignmentIdParam,
  subjectBody,
} from "../validators/subjectValidators.js";

const router = Router({ mergeParams: true });

router
  .route("/")
  .get(studentIdParam, validateRequest, getSubjects)
  .post(studentIdParam, subjectBody, validateRequest, postSubject);

router
  .route("/:assignmentId")
  .get(studentIdParam, assignmentIdParam, validateRequest, getSubjectById)
  .put(
    studentIdParam,
    assignmentIdParam,
    subjectBody,
    validateRequest,
    putSubject,
  )
  .delete(
    studentIdParam,
    assignmentIdParam,
    validateRequest,
    deleteSubject,
  );

export default router;
