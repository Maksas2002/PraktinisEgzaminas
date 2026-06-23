import { sql } from "../db/connection.js";

export async function findStudents(filters) {
  const course = filters.course ? Number(filters.course) : null;
  const id = filters.id ? Number(filters.id) : null;
  const firstName = filters.firstName?.trim() || null;
  const lastName = filters.lastName?.trim() || null;

  return sql`
    SELECT
      s.id,
      s.first_name AS "firstName",
      s.last_name AS "lastName",
      s.course,
      s.created_at AS "createdAt",
      s.updated_at AS "updatedAt",
      COUNT(ss.id)::int AS "subjectCount"
    FROM students s
    LEFT JOIN student_subjects ss ON ss.student_id = s.id
    WHERE (${course}::int IS NULL OR s.course = ${course})
      AND (${id}::int IS NULL OR s.id = ${id})
      AND (${firstName}::text IS NULL OR s.first_name ILIKE ${firstName ? `%${firstName}%` : null})
      AND (${lastName}::text IS NULL OR s.last_name ILIKE ${lastName ? `%${lastName}%` : null})
    GROUP BY s.id
    ORDER BY s.last_name, s.first_name, s.id
  `;
}

export async function findStudentById(id) {
  const rows = await sql`
    SELECT
      s.id,
      s.first_name AS "firstName",
      s.last_name AS "lastName",
      s.course,
      s.created_at AS "createdAt",
      s.updated_at AS "updatedAt",
      COUNT(ss.id)::int AS "subjectCount"
    FROM students s
    LEFT JOIN student_subjects ss ON ss.student_id = s.id
    WHERE s.id = ${id}
    GROUP BY s.id
  `;
  return rows[0];
}

export async function insertStudent({ firstName, lastName, course }) {
  const rows = await sql`
    INSERT INTO students (first_name, last_name, course)
    VALUES (${firstName.trim()}, ${lastName.trim()}, ${Number(course)})
    RETURNING
      id,
      first_name AS "firstName",
      last_name AS "lastName",
      course,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
  return { ...rows[0], subjectCount: 0 };
}

export async function updateStudentById(id, { firstName, lastName, course }) {
  const rows = await sql`
    UPDATE students
    SET
      first_name = ${firstName.trim()},
      last_name = ${lastName.trim()},
      course = ${Number(course)},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING
      id,
      first_name AS "firstName",
      last_name AS "lastName",
      course,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `;
  return rows[0];
}

export async function deleteStudentById(id) {
  const rows = await sql`
    DELETE FROM students
    WHERE id = ${id}
    RETURNING id, first_name AS "firstName", last_name AS "lastName"
  `;
  return rows[0];
}
