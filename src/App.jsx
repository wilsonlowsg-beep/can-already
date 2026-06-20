import {
  Banknote,
  Building2,
  Calculator,
  HeartPulse,
  Home,
  Landmark,
  LineChart,
  Moon,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AssumptionForm from './components/AssumptionForm';
import Metric from './components/Metric';
import MoneyForm from './components/MoneyForm';
import ScoreCard from './components/ScoreCard';
import StatusPill from './components/StatusPill';
import { DEFAULT_ASSUMPTIONS, DEFAULT_INPUTS } from './data/defaults';
import { useLocalStorage } from './hooks/useLocalStorage';
import { calculateInvestmentScenario, calculateReadiness, getStatus } from './utils/calculations';
import { currency, number, percent } from './utils/format';

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'retirement', label: 'Retirement', icon: Moon },
  { id: 'cpf', label: 'CPF', icon: Landmark },
  { id: 'property', label: 'Property', icon: Building2 },
  { id: 'invest', label: 'Invest', icon: LineChart },
  { id: 'scenario', label: 'Scenario', icon: Calculator },
];

function PlainEnglishList({ items }) {
  return (
    <div className="plain-list">
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

function Dashboard({ inputs, results, setInputs, resetAll }) {
  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">Singapore money check</p>
          <h1>Can Already?</h1>
          <p>
            A quick heartland-style estimate for retirement, CPF, condo upgrade, and whether the
            monthly budget can still breathe.
          </p>
        </div>
        <div className={`verdict ${results.overallStatus}`}>
          <span>Overall verdict</span>
          <strong>{results.overallScore}/100</strong>
          <StatusPill status={results.overallStatus} />
        </div>
      </section>

      <section className="score-grid">
        <ScoreCard title="Can retire already?" score={results.retirementScore}>
          Your money may last about {number(results.drawdownYears)} years from retirement.
        </ScoreCard>
        <ScoreCard title="Am I CPF-ready?" score={results.cpfScore}>
          CPF balances are compared with your editable retirement sums.
        </ScoreCard>
        <ScoreCard title="Can upgrade already?" score={results.propertyScore}>
          Estimated new mortgage is {percent(results.housingRatio)} of monthly income.
        </ScoreCard>
        <ScoreCard title="Can sleep well already?" score={results.cashflowScore}>
          After the upgrade, estimated monthly surplus is {currency(results.monthlySurplus)}.
        </ScoreCard>
      </section>

      <section className="panel">
        <div className="section-title">
          <p>At a glance</p>
          <h2>Your household snapshot</h2>
        </div>
        <div className="metric-grid">
          <Metric label="Net worth estimate" value={currency(results.totalNetWorth)} />
          <Metric label="Liquid assets" value={currency(results.liquidAssets)} />
          <Metric label="CPF total" value={currency(results.cpfTotal)} />
          <Metric label="Property equity" value={currency(results.propertyEquity)} />
        </div>
        <button className="ghost-button" type="button" onClick={resetAll}>
          <RotateCcw size={16} aria-hidden="true" />
          Reset sample numbers
        </button>
      </section>

      <MoneyForm inputs={inputs} setInputs={setInputs} />
    </>
  );
}

function RetirementEngine({ inputs, results, assumptions, setAssumptions }) {
  const status = getStatus(results.retirementScore);
  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">Retirement Engine</p>
          <h1>Can retire already?</h1>
        </div>
        <StatusPill status={status} />
      </section>
      <section className="panel">
        <div className="metric-grid">
          <Metric label="Projected pool at retirement" value={currency(results.retirementPool)} />
          <Metric label="Future yearly spending" value={currency(results.futureAnnualSpending)} />
          <Metric label="CPF LIFE yearly payout" value={currency(results.cpfLifeAnnualPayout)} />
          <Metric label="Years money may last" value={`${number(results.drawdownYears)} years`} />
          <Metric label="Without CPF LIFE" value={`${number(results.drawdownYearsWithoutCpfLife)} years`} />
          <Metric label="Target years" value={`${number(results.neededYears)} years`} />
        </div>
        <PlainEnglishList
          items={[
            `You have about ${number(results.yearsToRetirement)} years to retirement age ${assumptions.retirementAge}.`,
            `CPF LIFE payout is assumed to start at age ${assumptions.cpfLifeStartAge} with ${currency(assumptions.cpfLifeMonthlyPayout)} per month.`,
            `The model grows cash and investments at ${assumptions.expectedReturn}% and spending at ${assumptions.inflation}%.`,
            status === 'green'
              ? 'Looks comfortable on this simple estimate.'
              : 'Try lowering spending, retiring later, or building more liquid assets.',
          ]}
        />
      </section>
      <AssumptionForm assumptions={assumptions} setAssumptions={setAssumptions} />
    </>
  );
}

function CPFEngine({ inputs, results, assumptions, setAssumptions }) {
  const status = getStatus(results.cpfScore);
  const retirementBase = inputs.cpfRA > 0 ? inputs.cpfRA : inputs.cpfSA + inputs.cpfRA;

  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">CPF Engine</p>
          <h1>Am I CPF-ready?</h1>
        </div>
        <StatusPill status={status} />
      </section>
      <section className="panel">
        <div className="metric-grid">
          <Metric label="OA" value={currency(inputs.cpfOA)} />
          <Metric label="SA + RA checked" value={currency(retirementBase)} />
          <Metric label="MA" value={currency(inputs.cpfMA)} />
          <Metric label="CPF total" value={currency(results.cpfTotal)} />
          <Metric label="CPF LIFE payout used" value={`${currency(assumptions.cpfLifeMonthlyPayout)} / mth`} />
        </div>
        <PlainEnglishList
          items={[
            `OA interest assumption: 2.5%. SA, MA, and RA interest assumption: 4.0%.`,
            `Full Retirement Sum setting is ${currency(assumptions.fullRetirementSum)}.`,
            `CPF LIFE is modelled as lifetime monthly income from age ${assumptions.cpfLifeStartAge}. Use CPF's official estimator for actual payout figures.`,
            'This is not an official CPF projection and does not include every CPF rule.',
          ]}
        />
      </section>
      <AssumptionForm assumptions={assumptions} setAssumptions={setAssumptions} />
    </>
  );
}

function PropertyEngine({ results, assumptions, setAssumptions }) {
  const status = getStatus(results.propertyScore);
  const ratioHigh = results.housingRatio > 35;

  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">Property Engine</p>
          <h1>Can upgrade from HDB to condo already?</h1>
        </div>
        <StatusPill status={status} />
      </section>
      <section className="panel">
        <div className="metric-grid">
          <Metric label="Cash from sale after loan and CPF used" value={currency(results.saleProceedsBeforeCosts)} />
          <Metric label="Estimated new loan" value={currency(results.targetLoan)} />
          <Metric label="Stress-tested mortgage" value={currency(results.upgradeMortgage)} />
          <Metric
            label="Housing cost vs income"
            value={percent(results.housingRatio)}
            tone={ratioHigh ? 'danger' : 'good'}
          />
        </div>
        <PlainEnglishList
          items={[
            ratioHigh
              ? 'Housing cost is above 35% of monthly income. This may feel tight.'
              : 'Housing cost is within the 35% comfort line used by this app.',
            `Upgrade impact: retirement score could shift from ${results.retirementScore} to ${results.retirementImpact}.`,
            'Buyer stamp duty, agent fees, renovation, and CPF refund interest are not fully modelled in this MVP.',
          ]}
        />
      </section>
      <AssumptionForm assumptions={assumptions} setAssumptions={setAssumptions} />
    </>
  );
}

function ScenarioSimulator({ inputs, setInputs, results, assumptions, setAssumptions }) {
  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">Scenario Simulator</p>
          <h1>Try a different future</h1>
        </div>
        <StatusPill status={results.overallStatus} />
      </section>
      <section className="panel scenario">
        <div className="section-title">
          <p>Live result</p>
          <h2>{results.overallScore}/100 overall</h2>
        </div>
        <div className="metric-grid">
          <Metric label="Retirement" value={`${results.retirementScore}/100`} />
          <Metric label="CPF" value={`${results.cpfScore}/100`} />
          <Metric label="Property" value={`${results.propertyScore}/100`} />
          <Metric label="Cashflow" value={`${results.cashflowScore}/100`} />
        </div>
      </section>
      <MoneyForm inputs={inputs} setInputs={setInputs} />
      <AssumptionForm assumptions={assumptions} setAssumptions={setAssumptions} />
    </>
  );
}

function SliderField({ label, value, onChange, suffix = '%' }) {
  return (
    <label className="slider-field">
      <span>{label}</span>
      <div>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <strong>
          {value}
          {suffix}
        </strong>
      </div>
    </label>
  );
}

function InvestAlready({ inputs, setInputs, assumptions, setAssumptions, results }) {
  const investment = calculateInvestmentScenario(inputs, assumptions, results);
  const allocationOk = Math.round(investment.allocationTotal) === 100;
  const status = getStatus(investment.adjustedRetirementScore);
  const updateInput = (key, value) => setInputs((current) => ({ ...current, [key]: value }));
  const updateAssumption = (key, value) => setAssumptions((current) => ({ ...current, [key]: value }));

  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">Invest Already</p>
          <h1>Will investing help?</h1>
        </div>
        <StatusPill status={status} />
      </section>

      <section className="panel scenario">
        <div className="section-title">
          <p>Portfolio estimate</p>
          <h2>{currency(investment.projectedValue)} after {number(inputs.investmentHorizon)} years</h2>
        </div>
        <div className="metric-grid">
          <Metric label="Monthly investment" value={currency(inputs.monthlyInvestment)} />
          <Metric label="Weighted return" value={percent(investment.weightedReturn)} />
          <Metric label="Real value today" value={currency(investment.realValue)} />
          <Metric label="Retirement score impact" value={`${investment.retirementScoreLift >= 0 ? '+' : ''}${investment.retirementScoreLift}`} />
        </div>
        <PlainEnglishList
          items={[
            allocationOk
              ? 'Allocation adds up to 100%. Nice and tidy.'
              : `Allocation adds up to ${number(investment.allocationTotal)}%. Try to make it 100%.`,
            investment.concentration > 60
              ? 'One bucket is above 60%. That may be too concentrated for some people.'
              : 'No single bucket is above 60% in this simple check.',
            `Estimated investment gain is ${currency(investment.gainEstimate)} before taxes, fees, and bad timing.`,
            'Returns are assumptions, not predictions. Markets can go down for years.',
          ]}
        />
      </section>

      <section className="panel">
        <div className="section-title">
          <p>Monthly plan</p>
          <h2>How much and how long?</h2>
        </div>
        <div className="form-grid compact">
          <label className="field" htmlFor="monthly-investment">
            <span>Monthly investment</span>
            <div className="input-wrap">
              <input
                id="monthly-investment"
                min="0"
                type="number"
                inputMode="decimal"
                value={inputs.monthlyInvestment}
                onFocus={(event) => event.target.select()}
                onChange={(event) => updateInput('monthlyInvestment', Number(event.target.value))}
              />
            </div>
          </label>
          <label className="field" htmlFor="investment-horizon">
            <span>Investment horizon</span>
            <div className="input-wrap">
              <input
                id="investment-horizon"
                min="0"
                type="number"
                inputMode="decimal"
                value={inputs.investmentHorizon}
                onFocus={(event) => event.target.select()}
                onChange={(event) => updateInput('investmentHorizon', Number(event.target.value))}
              />
              <small>yrs</small>
            </div>
          </label>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <p>Allocation</p>
          <h2>Where the monthly money goes</h2>
        </div>
        <div className="allocation-total">
          <span>Total</span>
          <strong className={allocationOk ? 'ok' : 'warn'}>{number(investment.allocationTotal)}%</strong>
        </div>
        <div className="slider-grid">
          <SliderField
            label="S&P 500"
            value={inputs.sp500Allocation}
            onChange={(value) => updateInput('sp500Allocation', value)}
          />
          <SliderField
            label="SG banks"
            value={inputs.sgBanksAllocation}
            onChange={(value) => updateInput('sgBanksAllocation', value)}
          />
          <SliderField
            label="STI ETF"
            value={inputs.stiAllocation}
            onChange={(value) => updateInput('stiAllocation', value)}
          />
          <SliderField
            label="T-bills / cash"
            value={inputs.tbillsAllocation}
            onChange={(value) => updateInput('tbillsAllocation', value)}
          />
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <p>Return assumptions</p>
          <h2>Edit, do not blindly believe</h2>
        </div>
        <div className="form-grid compact">
          {[
            ['S&P 500 return', 'sp500Return'],
            ['SG banks return', 'sgBanksReturn'],
            ['STI ETF return', 'stiReturn'],
            ['T-bills return', 'tbillsReturn'],
          ].map(([label, key]) => (
            <label className="field" htmlFor={key} key={key}>
              <span>{label}</span>
              <div className="input-wrap">
                <input
                  id={key}
                  min="0"
                  type="number"
                  inputMode="decimal"
                  value={assumptions[key]}
                  onFocus={(event) => event.target.select()}
                  onChange={(event) => updateAssumption(key, Number(event.target.value))}
                />
                <small>%</small>
              </div>
            </label>
          ))}
        </div>
      </section>
    </>
  );
}

function AssumptionsPage({ assumptions, setAssumptions }) {
  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">Simple assumptions</p>
          <h1>No jargon, just knobs</h1>
        </div>
        <ShieldCheck size={34} aria-hidden="true" />
      </section>
      <section className="panel">
        <PlainEnglishList
          items={[
            'Retirement uses a simple drawdown model. It is not a full financial plan.',
            'CPF LIFE is included as an editable monthly payout assumption, not an official quote.',
            'CPF sums are editable because official numbers can change over time.',
            'Property affordability uses estimated mortgage payment and flags housing cost above 35% of income.',
            'This is an educational estimate, not financial advice.',
          ]}
        />
      </section>
      <AssumptionForm assumptions={assumptions} setAssumptions={setAssumptions} />
    </>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [inputs, setInputs] = useLocalStorage('can-already-inputs', DEFAULT_INPUTS);
  const [assumptions, setAssumptions] = useLocalStorage(
    'can-already-assumptions',
    DEFAULT_ASSUMPTIONS,
  );
  const results = useMemo(() => calculateReadiness(inputs, assumptions), [inputs, assumptions]);

  const resetAll = () => {
    setInputs(DEFAULT_INPUTS);
    setAssumptions(DEFAULT_ASSUMPTIONS);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#dashboard" onClick={() => setActivePage('dashboard')}>
          <span>Can</span> Already?
        </a>
        <button className="assumptions-link" type="button" onClick={() => setActivePage('assumptions')}>
          <Banknote size={16} aria-hidden="true" />
          Assumptions
        </button>
      </header>

      <main>
        {activePage === 'dashboard' && (
          <Dashboard inputs={inputs} setInputs={setInputs} results={results} resetAll={resetAll} />
        )}
        {activePage === 'retirement' && (
          <RetirementEngine
            inputs={inputs}
            results={results}
            assumptions={assumptions}
            setAssumptions={setAssumptions}
          />
        )}
        {activePage === 'cpf' && (
          <CPFEngine
            inputs={inputs}
            results={results}
            assumptions={assumptions}
            setAssumptions={setAssumptions}
          />
        )}
        {activePage === 'property' && (
          <PropertyEngine results={results} assumptions={assumptions} setAssumptions={setAssumptions} />
        )}
        {activePage === 'invest' && (
          <InvestAlready
            inputs={inputs}
            setInputs={setInputs}
            assumptions={assumptions}
            setAssumptions={setAssumptions}
            results={results}
          />
        )}
        {activePage === 'scenario' && (
          <ScenarioSimulator
            inputs={inputs}
            setInputs={setInputs}
            results={results}
            assumptions={assumptions}
            setAssumptions={setAssumptions}
          />
        )}
        {activePage === 'assumptions' && (
          <AssumptionsPage assumptions={assumptions} setAssumptions={setAssumptions} />
        )}
      </main>

      <footer className="disclaimer">
        <HeartPulse size={16} aria-hidden="true" />
        This is an educational estimate, not financial advice.
      </footer>

      <nav className="bottom-nav" aria-label="Primary">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <button
              key={page.id}
              className={activePage === page.id ? 'active' : ''}
              type="button"
              onClick={() => setActivePage(page.id)}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{page.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
