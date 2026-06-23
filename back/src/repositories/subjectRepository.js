import { sql } from "../db/connection.js";

export function findStudentSubjects(studentId) {
  return sql`
    SELECT
      ss.id,
      ss.student_id AS "studentId",
      sub.id AS "subjectId",
      sub.name,
      sub.credits,
      ss.created_at AS "createdAt"
    FROM student_subjects ss
    JOIN subjects sub ON sub.id = ss.subject_id
    WHERE ss.student_id = ${studentId}
    ORDER BY sub.name, ss.id
  `;
}

async function findStudentSubjectByIdWithClient(client, studentId, assignmentId) {
  const rows = await client`
    SELECT
      ss.id,
      ss.student_id AS "studentId",
      sub.id AS "subjectId",
      sub.name,
      sub.credits,
      ss.created_at AS "createdAt"
    FROM student_subjects ss
    JOIN subjects sub ON sub.id = ss.subject_id
    WHERE ss.student_id = ${studentId} AND ss.id = ${assignmentId}
  `;
  return rows[0];
}

export function findStudentSubjectById(studentId, assignmentId) {
  return findStudentSubjectByIdWithClient(sql, studentId, assignmentId);
}

async function getOrCreateSubject(transaction, { name, credits }) {
  const rows = await transaction`
    INSERT INTO subjects (name, credits)
    VALUES (${name.trim()}, ${Number(credits)})
    ON CONFLICT (name, credits)
    DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;
  return rows[0].id;
}

export function insertStudentSubject(studentId, data) {
  return sql.begin(async (transaction) => {
    const subjectId = await getOrCreateSubject(transaction, data);
    const rows = await transaction`
      INSERT INTO student_subjects (student_id, subject_id)
      VALUES (${studentId}, ${subjectId})
      RETURNING id
    `;
    return findStudentSubjectByIdWithClient(
      transaction,
      studentId,
      rows[0].id,
    );
  });
}

export function updateStudentSubject(studentId, assignmentId, data) {
  return sql.begin(async (transaction) => {
    const subjectId = await getOrCreateSubject(transaction, data);
    const rows = await transaction`
      UPDATE student_subjects
      SET subject_id = ${subjectId}
      WHERE id = ${assignmentId} AND student_id = ${studentId}
      RETURNING id
    `;
    if (!rows[0]) return undefined;
    return findStudentSubjectByIdWithClient(
      transaction,
      studentId,
      rows[0].id,
    );
  });
}

export async function deleteStudentSubject(studentId, assignmentId) {
  const rows = await sql`
    DELETE FROM student_subjects
    WHERE id = ${assignmentId} AND student_id = ${studentId}
    RETURNING id
  `;
  return rows[0];
}
