export function StudentList({
  students,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  loading,
}) {
  if (loading) {
    return <div className="empty-state">Kraunamas studentų sąrašas…</div>;
  }

  if (!students.length) {
    return (
      <div className="empty-state">
        <span aria-hidden="true">∅</span>
        <strong>Studentų nerasta</strong>
        <p>Pakeiskite filtrus arba pridėkite naują studentą.</p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Studentas</th>
            <th>Kursas</th>
            <th>Dalykų</th>
            <th><span className="sr-only">Veiksmai</span></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className={selectedId === student.id ? "selected" : ""}
            >
              <td>#{student.id}</td>
              <td>
                <button
                  className="student-link"
                  onClick={() => onSelect(student.id)}
                >
                  <span className="avatar">
                    {student.firstName[0]}
                    {student.lastName[0]}
                  </span>
                  <span>
                    <strong>{student.firstName} {student.lastName}</strong>
                    <small>Peržiūrėti informaciją</small>
                  </span>
                </button>
              </td>
              <td><span className="course-badge">{student.course}</span></td>
              <td>{student.subjectCount}</td>
              <td>
                <div className="row-actions">
                  <button
                    className="icon-button"
                    onClick={() => onEdit(student)}
                    aria-label={`Redaguoti ${student.firstName}`}
                    title="Redaguoti"
                  >
                    ✎
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => onDelete(student)}
                    aria-label={`Pašalinti ${student.firstName}`}
                    title="Pašalinti"
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

