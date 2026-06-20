import {
  Banknote,
  Building2,
  Calculator,
  HeartPulse,
  Home,
  Landmark,
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
import { calculateReadiness, getStatus } from './utils/calculations';
import { currency, number, percent } from './utils/format';

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'retirement', label: 'Retirement', icon: Moon },
  { id: 'cpf', label: 'CPF', icon: Landmark },
  { id: 'property', label: 'Property', icon: Building2 },
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
          <Metric label="Years money may last" value={`${number(results.drawdownYears)} years`} />
          <Metric label="Target years" value={`${number(results.neededYears)} years`} />
        </div>
        <PlainEnglishList
          items={[
            `You have about ${number(results.yearsToRetirement)} years to retirement age ${assumptions.retirementAge}.`,
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
        </div>
        <PlainEnglishList
          items={[
            `OA interest assumption: 2.5%. SA, MA, and RA interest assumption: 4.0%.`,
            `Full Retirement Sum setting is ${currency(assumptions.fullRetirementSum)}.`,
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
