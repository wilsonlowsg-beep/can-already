import StatusPill from './StatusPill';
import { getStatus } from '../utils/calculations';

export default function ScoreCard({ title, score, children }) {
  const status = getStatus(score);

  return (
    <article className="card score-card">
      <div className="card-heading">
        <h3>{title}</h3>
        <StatusPill status={status} />
      </div>
      <div className={`score-ring ${status}`} aria-label={`${score} out of 100`}>
        <span>{score}</span>
      </div>
      <p>{children}</p>
    </article>
  );
}
