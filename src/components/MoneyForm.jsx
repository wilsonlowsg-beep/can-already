import Field from './Field';

export default function MoneyForm({ inputs, setInputs }) {
  const update = (key, value) => setInputs((current) => ({ ...current, [key]: value }));

  return (
    <section className="panel">
      <div className="section-title">
        <p>My Numbers</p>
        <h2>Key in once, estimate everywhere</h2>
      </div>
      <div className="form-grid">
        <Field label="Age" value={inputs.age} onChange={(value) => update('age', value)} />
        <Field
          label="Monthly income"
          value={inputs.monthlyIncome}
          onChange={(value) => update('monthlyIncome', value)}
        />
        <Field
          label="Monthly spending"
          value={inputs.monthlySpending}
          onChange={(value) => update('monthlySpending', value)}
        />
        <Field label="CPF OA" value={inputs.cpfOA} onChange={(value) => update('cpfOA', value)} />
        <Field label="CPF SA" value={inputs.cpfSA} onChange={(value) => update('cpfSA', value)} />
        <Field label="CPF MA" value={inputs.cpfMA} onChange={(value) => update('cpfMA', value)} />
        <Field label="CPF RA" value={inputs.cpfRA} onChange={(value) => update('cpfRA', value)} />
        <Field label="Cash" value={inputs.cash} onChange={(value) => update('cash', value)} />
        <Field
          label="Investments"
          value={inputs.investments}
          onChange={(value) => update('investments', value)}
        />
        <Field
          label="Monthly investment"
          value={inputs.monthlyInvestment}
          onChange={(value) => update('monthlyInvestment', value)}
        />
      </div>
    </section>
  );
}
