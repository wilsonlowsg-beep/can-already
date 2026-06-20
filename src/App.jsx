import {
  Banknote,
  HeartPulse,
  Home,
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
import { calculateReadiness, getStatus } from './utils/calculations';
import { currency, number, percent } from './utils/format';

const pages = [
  { id: 'dashboard', label: 'Start', icon: Home },
  { id: 'retirement', label: 'Retire', icon: Moon },
  { id: 'investment', label: 'Invest', icon: LineChart },
  { id: 'sleep', label: 'Sleep', icon: HeartPulse },
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
            Answer three simple money questions first. No jargon, no spreadsheet feeling.
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
          Includes your CPF LIFE payout assumption and current savings.
        </ScoreCard>
        <ScoreCard title="Can invest already?" score={results.investmentScore}>
          You plan to invest {percent(results.investRatio)} of monthly income.
        </ScoreCard>
        <ScoreCard title="Can sleep well already?" score={results.cashflowScore}>
          After spending and investing, estimated monthly surplus is {currency(results.monthlySurplus)}.
        </ScoreCard>
      </section>

      <section className="panel">
        <div className="section-title">
          <p>At a glance</p>
          <h2>Your household snapshot</h2>
        </div>
        <div className="metric-grid">
          <Metric label="Net worth estimate" value={currency(results.totalNetWorth)} />
          <Metric label="Monthly income" value={currency(inputs.monthlyIncome)} />
          <Metric label="Monthly spending" value={currency(inputs.monthlySpending)} />
          <Metric label="Cash buffer" value={currency(inputs.cash)} />
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

function InvestmentEngine({ inputs, results, assumptions, setAssumptions }) {
  const status = getStatus(results.investmentScore);
  const surplusGood = results.monthlySurplus >= 0;

  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">Investment Check</p>
          <h1>Can invest already?</h1>
        </div>
        <StatusPill status={status} />
      </section>
      <section className="panel">
        <div className="metric-grid">
          <Metric label="Monthly investment" value={currency(inputs.monthlyInvestment)} />
          <Metric label="Investment vs income" value={percent(results.investRatio)} />
          <Metric label="Projected by retirement" value={currency(results.projectedInvestmentValue)} />
          <Metric
            label="Monthly surplus"
            value={currency(results.monthlySurplus)}
            tone={surplusGood ? 'good' : 'danger'}
          />
        </div>
        <PlainEnglishList
          items={[
            surplusGood
              ? 'This investing amount still leaves monthly breathing room.'
              : 'This investing amount may be too high for your current cashflow.',
            results.emergencyMonths >= 6
              ? 'Your cash buffer looks okay before investing.'
              : 'Build a stronger cash buffer before investing too aggressively.',
            `Projected using the editable ${assumptions.expectedReturn}% yearly return assumption.`,
          ]}
        />
      </section>
      <AssumptionForm assumptions={assumptions} setAssumptions={setAssumptions} />
    </>
  );
}

function SleepWellEngine({ inputs, results }) {
  const status = getStatus(results.cashflowScore);
  const surplusGood = results.monthlySurplus >= 0;

  return (
    <>
      <section className="engine-head">
        <div>
          <p className="eyebrow">Sleep Well Check</p>
          <h1>Can sleep well already?</h1>
        </div>
        <StatusPill status={status} />
      </section>
      <section className="panel">
        <div className="metric-grid">
          <Metric label="Monthly income" value={currency(inputs.monthlyIncome)} />
          <Metric label="Monthly spending" value={currency(inputs.monthlySpending)} />
          <Metric
            label="After investing"
            value={currency(results.monthlySurplus)}
            tone={surplusGood ? 'good' : 'danger'}
          />
          <Metric label="Cash buffer" value={`${number(results.emergencyMonths)} months`} />
        </div>
        <PlainEnglishList
          items={[
            surplusGood
              ? 'Your monthly cashflow still has breathing room in this estimate.'
              : 'Your monthly cashflow may be negative after spending and investing.',
            results.emergencyMonths >= 6
              ? 'Your cash buffer is at least six months of spending.'
              : 'Try to build at least six months of cash buffer before taking big risks.',
            'This check is about stress, not maximising returns.',
          ]}
        />
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
            'CPF LIFE and investment returns are included as editable assumptions, not official quotes or predictions.',
            'CPF sums are editable because official numbers can change over time.',
            'Investment readiness checks monthly investing against cashflow and cash buffer.',
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
        {activePage === 'investment' && (
          <InvestmentEngine
            inputs={inputs}
            results={results}
            assumptions={assumptions}
            setAssumptions={setAssumptions}
          />
        )}
        {activePage === 'sleep' && (
          <SleepWellEngine inputs={inputs} results={results} />
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
