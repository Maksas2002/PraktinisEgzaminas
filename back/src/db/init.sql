CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  course SMALLINT NOT NULL CHECK (course BETWEEN 1 AND 6),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  credits SMALLINT NOT NULL CHECK (credits BETWEEN 1 AND 30),
  CONSTRAINT subjects_name_credits_unique UNIQUE (name, credits)
);

CREATE TABLE IF NOT EXISTS student_subjects (
  id SERIAL PRIMARY KEY,
  student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT student_subject_unique UNIQUE (student_id, subject_id)
);

CREATE INDEX IF NOT EXISTS students_course_idx ON students(course);
CREATE INDEX IF NOT EXISTS students_name_idx ON students(first_name, last_name);
CREATE INDEX IF NOT EXISTS student_subjects_student_idx ON student_subjects(student_id);

INSERT INTO students (first_name, last_name, course)
VALUES
  ('Austėja', 'Kazlauskaitė', 1),
  ('Mantas', 'Petrauskas', 2),
  ('Ieva', 'Jankauskaitė', 3)
ON CONFLICT DO NOTHING;

INSERT INTO subjects (name, credits)
VALUES
  ('JavaScript programavimas', 6),
  ('Duomenų bazės', 5),
  ('WEB technologijos', 6)
ON CONFLICT DO NOTHING;

INSERT INTO student_subjects (student_id, subject_id)
SELECT 1, id FROM subjects WHERE name IN ('JavaScript programavimas', 'WEB technologijos')
ON CONFLICT DO NOTHING;

INSERT INTO student_subjects (student_id, subject_id)
SELECT 2, id FROM subjects WHERE name = 'Duomenų bazės'
ON CONFLICT DO NOTHING;

