import { CheckCircle2, CircleAlert, CircleX } from 'lucide-react';
import { statusText } from '../utils/calculations';

const icons = {
  green: CheckCircle2,
  amber: CircleAlert,
  red: CircleX,
};

export default function StatusPill({ status }) {
  const Icon = icons[status] || CircleAlert;
  return (
    <span className={`status-pill ${status}`}>
      <Icon size={16} aria-hidden="true" />
      {statusText(status)}
    </span>
  );
}
