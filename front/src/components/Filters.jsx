export function Filters({ filters, onChange, onReset }) {
  return (
    <form className="filters" onSubmit={(event) => event.preventDefault()}>
      <div className="filter-title">
        <span className="filter-icon" aria-hidden="true">⌕</span>
        <strong>Paieška ir filtrai</strong>
      </div>

      <label>
        ID
        <input
          type="number"
          min="1"
          value={filters.id}
          onChange={(event) => onChange({ ...filters, id: event.target.value })}
          placeholder="ID"
        />
      </label>

      <label>
        Vardas
        <input
          value={filters.firstName}
          onChange={(event) =>
            onChange({ ...filters, firstName: event.target.value })
          }
          placeholder="Ieškoti vardo"
        />
      </label>

      <label>
        Pavardė
        <input
          value={filters.lastName}
          onChange={(event) =>
            onChange({ ...filters, lastName: event.target.value })
          }
          placeholder="Ieškoti pavardės"
        />
      </label>

      <label>
        Kursas
        <select
          value={filters.course}
          onChange={(event) =>
            onChange({ ...filters, course: event.target.value })
          }
        >
          <option value="">Visi kursai</option>
          {[1, 2, 3, 4, 5, 6].map((course) => (
            <option key={course} value={course}>
              {course} kursas
            </option>
          ))}
        </select>
      </label>

      <button className="button ghost" type="button" onClick={onReset}>
        Išvalyti
      </button>
    </form>
  );
}

