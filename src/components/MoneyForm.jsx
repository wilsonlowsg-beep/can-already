import Field from './Field';
import { HOME_TYPES } from '../data/defaults';

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
          label="Property value"
          value={inputs.propertyValue}
          onChange={(value) => update('propertyValue', value)}
        />
        <Field
          label="Outstanding loan"
          value={inputs.outstandingLoan}
          onChange={(value) => update('outstandingLoan', value)}
        />
        <Field
          label="CPF used for housing"
          value={inputs.cpfUsedForHousing}
          onChange={(value) => update('cpfUsedForHousing', value)}
        />
        <Field
          label="Current home type"
          value={inputs.currentHomeType}
          onChange={(value) => update('currentHomeType', value)}
          options={HOME_TYPES}
        />
        <Field
          label="Target property price"
          value={inputs.targetPropertyPrice}
          onChange={(value) => update('targetPropertyPrice', value)}
        />
      </div>
    </section>
  );
}
