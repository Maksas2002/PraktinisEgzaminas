import { Router } from "express";
import {
  deleteStudent,
  getStudentById,
  getStudents,
  postStudent,
  putStudent,
} from "../controllers/studentController.js";
import {
  idParam,
  studentBody,
  studentFilters,
} from "../validators/studentValidators.js";
import { validateRequest } from "../middleware/validateRequest.js";

const router = Router();

router
  .route("/")
  .get(studentFilters, validateRequest, getStudents)
  .post(studentBody, validateRequest, postStudent);

router
  .route("/:id")
  .get(idParam, validateRequest, getStudentById)
  .put(idParam, studentBody, validateRequest, putStudent)
  .delete(idParam, validateRequest, deleteStudent);

export default router;
