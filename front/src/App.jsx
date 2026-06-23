import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import { Filters } from "./components/Filters.jsx";
import { StudentDetails } from "./components/StudentDetails.jsx";
import { StudentForm } from "./components/StudentForm.jsx";
import { StudentList } from "./components/StudentList.jsx";

const emptyFilters = { id: "", firstName: "", lastName: "", course: "" };

export default function App() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.getStudents(filters);
      setStudents(result.data);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(loadStudents, 250);
    return () => clearTimeout(timer);
  }, [loadStudents]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [message]);

  async function selectStudent(id) {
    try {
      const result = await api.getStudent(id);
      setSelected(result.data);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  async function saveStudent(data) {
    setBusy(true);
    try {
      if (editing) {
        await api.updateStudent(editing.id, data);
        setMessage({ type: "success", text: "Studento duomenys atnaujinti." });
        if (selected?.id === editing.id) await selectStudent(editing.id);
      } else {
        await api.createStudent(data);
        setMessage({ type: "success", text: "Studentas sėkmingai pridėtas." });
      }
      setEditing(null);
      await loadStudents();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function removeStudent(student) {
    if (!window.confirm(`Pašalinti ${student.firstName} ${student.lastName}?`)) return;
    try {
      await api.deleteStudent(student.id);
      if (selected?.id === student.id) setSelected(null);
      if (editing?.id === student.id) setEditing(null);
      setMessage({
        type: "success",
        text: "Studentas ir visi susiję įrašai pašalinti.",
      });
      await loadStudents();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  async function subjectAction(action, successText) {
    setBusy(true);
    try {
      await action();
      await selectStudent(selected.id);
      await loadStudents();
      setMessage({ type: "success", text: successText });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="brand-mark" aria-hidden="true">SR</div>
        <div>
          <p className="eyebrow">Studijų administravimas</p>
          <h1>Studentų registras</h1>
        </div>
        <div className="api-status"><span /> REST API</div>
      </header>

      <main>
        <section className="hero">
          <div>
            <p className="eyebrow">Vienoje vietoje</p>
            <h2>Studentai, kursai ir mokomieji dalykai.</h2>
            <p>
              Patogiai kurkite, filtruokite ir tvarkykite studentų registro
              duomenis.
            </p>
          </div>
          <div className="stat">
            <strong>{students.length}</strong>
            <span>rasti studentai</span>
          </div>
        </section>

        {message && (
          <div className={`notice ${message.type}`} role="status">
            {message.text}
            <button onClick={() => setMessage(null)} aria-label="Uždaryti">×</button>
          </div>
        )}

        <div className="workspace">
          <section className="main-column">
            <Filters
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(emptyFilters)}
            />

            <section className="list-card">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">Registras</p>
                  <h2>Studentų sąrašas</h2>
                </div>
                <span className="count-badge">{students.length}</span>
              </div>
              <StudentList
                students={students}
                selectedId={selected?.id}
                onSelect={selectStudent}
                onEdit={setEditing}
                onDelete={removeStudent}
                loading={loading}
              />
            </section>
          </section>

          <div className="side-column">
            <StudentForm
              student={editing}
              onSave={saveStudent}
              onCancel={() => setEditing(null)}
              busy={busy}
            />
            <StudentDetails
              student={selected}
              onClose={() => setSelected(null)}
              busy={busy}
              onAddSubject={(data) =>
                subjectAction(
                  () => api.createSubject(selected.id, data),
                  "Mokomasis dalykas pridėtas.",
                )
              }
              onUpdateSubject={(id, data) =>
                subjectAction(
                  () => api.updateSubject(selected.id, id, data),
                  "Mokomasis dalykas atnaujintas.",
                )
              }
              onDeleteSubject={(subject) => {
                if (!window.confirm(`Pašalinti dalyką „${subject.name}“?`)) return;
                subjectAction(
                  () => api.deleteSubject(selected.id, subject.id),
                  "Mokomasis dalykas pašalintas.",
                );
              }}
            />
          </div>
        </div>
      </main>

      <footer>
        <p>Studentų registro sistema · React + Express + PostgreSQL</p>
      </footer>
    </>
  );
}

