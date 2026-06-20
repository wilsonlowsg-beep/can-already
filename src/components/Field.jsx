export default function Field({ label, value, onChange, type = 'number', options, suffix }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const isNumber = type === 'number';
  const displayValue = isNumber && Number(value) === 0 ? '' : value;
  const handleNumberChange = (event) => {
    const cleaned = event.target.value.replace(/[^\d.]/g, '').replace(/^0+(?=\d)/, '');
    onChange(cleaned === '' ? 0 : Number(cleaned));
  };

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
            type={isNumber ? 'text' : type}
            min="0"
            inputMode="decimal"
            placeholder={isNumber ? '0' : undefined}
            value={displayValue}
            onFocus={(event) => event.target.select()}
            onChange={isNumber ? handleNumberChange : (event) => onChange(event.target.value)}
          />
        )}
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}
