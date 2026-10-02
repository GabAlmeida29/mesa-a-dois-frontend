import clsx from 'clsx';

interface Props {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function IconButton({ label, danger = false, onClick, children }: Props) {
  return (
    <button
      type="button"
      className={clsx(danger ? 'btn-danger' : 'btn-ghost', '!p-2.5')}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}
