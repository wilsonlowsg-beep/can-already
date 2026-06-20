import Field from './Field';

export default function AssumptionForm({ assumptions, setAssumptions }) {
  const update = (key, value) => setAssumptions((current) => ({ ...current, [key]: value }));

  return (
    <section className="panel">
      <div className="section-title">
        <p>Assumptions</p>
        <h2>Adjust the model</h2>
      </div>
      <div className="form-grid compact">
        <Field
          label="Basic Retirement Sum"
          value={assumptions.basicRetirementSum}
          onChange={(value) => update('basicRetirementSum', value)}
        />
        <Field
          label="Full Retirement Sum"
          value={assumptions.fullRetirementSum}
          onChange={(value) => update('fullRetirementSum', value)}
        />
        <Field
          label="Enhanced Retirement Sum"
          value={assumptions.enhancedRetirementSum}
          onChange={(value) => update('enhancedRetirementSum', value)}
        />
        <Field
          label="Expected return"
          value={assumptions.expectedReturn}
          onChange={(value) => update('expectedReturn', value)}
          suffix="%"
        />
        <Field
          label="Inflation"
          value={assumptions.inflation}
          onChange={(value) => update('inflation', value)}
          suffix="%"
        />
        <Field
          label="Retirement age"
          value={assumptions.retirementAge}
          onChange={(value) => update('retirementAge', value)}
        />
        <Field
          label="Life expectancy"
          value={assumptions.lifeExpectancy}
          onChange={(value) => update('lifeExpectancy', value)}
        />
        <Field
          label="CPF LIFE start age"
          value={assumptions.cpfLifeStartAge}
          onChange={(value) => update('cpfLifeStartAge', value)}
        />
        <Field
          label="CPF LIFE monthly payout"
          value={assumptions.cpfLifeMonthlyPayout}
          onChange={(value) => update('cpfLifeMonthlyPayout', value)}
        />
        <Field
          label="CPF LIFE yearly increase"
          value={assumptions.cpfLifeEscalation}
          onChange={(value) => update('cpfLifeEscalation', value)}
          suffix="%"
        />
        <Field
          label="Mortgage rate"
          value={assumptions.mortgageRate}
          onChange={(value) => update('mortgageRate', value)}
          suffix="%"
        />
        <Field
          label="Mortgage tenure"
          value={assumptions.mortgageTenure}
          onChange={(value) => update('mortgageTenure', value)}
          suffix="yrs"
        />
      </div>
    </section>
  );
}
