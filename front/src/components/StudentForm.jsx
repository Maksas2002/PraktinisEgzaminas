import { useEffect, useState } from "react";

const emptyForm = { firstName: "", lastName: "", course: "1" };

export function StudentForm({ student, onSave, onCancel, busy }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(
      student
        ? {
            firstName: student.firstName,
            lastName: student.lastName,
            course: String(student.course),
          }
        : emptyForm,
    );
  }, [student]);

  function submit(event) {
    event.preventDefault();
    onSave({ ...form, course: Number(form.course) });
    if (!student) setForm(emptyForm);
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">{student ? "Redagavimas" : "Naujas įrašas"}</p>
          <h2>{student ? "Studento duomenys" : "Pridėti studentą"}</h2>
        </div>
        {student && (
          <button className="button ghost" type="button" onClick={onCancel}>
            Atšaukti
          </button>
        )}
      </div>

      <label>
        Vardas
        <input
          required
          minLength="2"
          maxLength="80"
          value={form.firstName}
          onChange={(event) =>
            setForm({ ...form, firstName: event.target.value })
          }
          placeholder="Pvz., Jonas"
        />
      </label>

      <label>
        Pavardė
        <input
          required
          minLength="2"
          maxLength="80"
          value={form.lastName}
          onChange={(event) =>
            setForm({ ...form, lastName: event.target.value })
          }
          placeholder="Pvz., Jonaitis"
        />
      </label>

      <label>
        Kursas
        <select
          value={form.course}
          onChange={(event) => setForm({ ...form, course: event.target.value })}
        >
          {[1, 2, 3, 4, 5, 6].map((course) => (
            <option key={course} value={course}>
              {course} kursas
            </option>
          ))}
        </select>
      </label>

      <button className="button primary full" disabled={busy}>
        {busy ? "Saugoma…" : student ? "Išsaugoti pakeitimus" : "Pridėti studentą"}
      </button>
    </form>
  );
}

