export default function Field({ label, value, onChange, type = 'number', options, suffix }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <div className="input-wrap">
        {options ? (
          <select id={id} value={value} onChange={(event) => onChange(event.target.value)}>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            min="0"
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
          />
        )}
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}
