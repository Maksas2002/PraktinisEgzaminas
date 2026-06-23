import { useEffect, useState } from "react";

const emptySubject = { name: "", credits: "3" };

export function StudentDetails({
  student,
  onClose,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  busy,
}) {
  const [form, setForm] = useState(emptySubject);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    setForm(emptySubject);
    setEditingId(null);
  }, [student?.id]);

  if (!student) {
    return (
      <aside className="detail-card detail-placeholder">
        <span className="big-icon" aria-hidden="true">◎</span>
        <h2>Studento informacija</h2>
        <p>Pasirinkite studentą sąraše, kad matytumėte jo dalykus ir kreditus.</p>
      </aside>
    );
  }

  function submit(event) {
    event.preventDefault();
    const payload = { ...form, credits: Number(form.credits) };
    if (editingId) onUpdateSubject(editingId, payload);
    else onAddSubject(payload);
    setForm(emptySubject);
    setEditingId(null);
  }

  function editSubject(subject) {
    setEditingId(subject.id);
    setForm({ name: subject.name, credits: String(subject.credits) });
  }

  const totalCredits = student.subjects.reduce(
    (sum, subject) => sum + subject.credits,
    0,
  );

  return (
    <aside className="detail-card">
      <div className="detail-header">
        <div className="avatar large">
          {student.firstName[0]}{student.lastName[0]}
        </div>
        <div>
          <p className="eyebrow">Studentas #{student.id}</p>
          <h2>{student.firstName} {student.lastName}</h2>
          <p>{student.course} kursas · {totalCredits} kreditų</p>
        </div>
        <button className="icon-button close" onClick={onClose} aria-label="Uždaryti">
          ×
        </button>
      </div>

      <section className="subjects">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Studijų planas</p>
            <h3>Mokomieji dalykai</h3>
          </div>
          <span className="count-badge">{student.subjects.length}</span>
        </div>

        <div className="subject-list">
          {student.subjects.length === 0 && (
            <p className="muted">Dalykų dar nepriskirta.</p>
          )}
          {student.subjects.map((subject) => (
            <article className="subject-item" key={subject.id}>
              <div>
                <strong>{subject.name}</strong>
                <small>{subject.credits} kreditai</small>
              </div>
              <div className="row-actions">
                <button
                  className="icon-button"
                  onClick={() => editSubject(subject)}
                  aria-label={`Redaguoti ${subject.name}`}
                >
                  ✎
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => onDeleteSubject(subject)}
                  aria-label={`Pašalinti ${subject.name}`}
                >
                  ×
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <form className="subject-form" onSubmit={submit}>
        <h3>{editingId ? "Redaguoti dalyką" : "Pridėti dalyką"}</h3>
        <label>
          Dalyko pavadinimas
          <input
            required
            minLength="2"
            maxLength="120"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Pvz., JavaScript programavimas"
          />
        </label>
        <label>
          Kreditų skaičius
          <input
            required
            type="number"
            min="1"
            max="30"
            value={form.credits}
            onChange={(event) =>
              setForm({ ...form, credits: event.target.value })
            }
          />
        </label>
        <div className="form-actions">
          {editingId && (
            <button
              type="button"
              className="button ghost"
              onClick={() => {
                setEditingId(null);
                setForm(emptySubject);
              }}
            >
              Atšaukti
            </button>
          )}
          <button className="button primary" disabled={busy}>
            {editingId ? "Išsaugoti" : "Pridėti dalyką"}
          </button>
        </div>
      </form>
    </aside>
  );
}

