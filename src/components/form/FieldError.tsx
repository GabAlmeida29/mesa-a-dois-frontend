import { AlertCircle } from 'lucide-react';

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="field-error flex items-start gap-1">
      <AlertCircle className="mt-px size-3.5 shrink-0" />
      {message}
    </p>
  );
}
