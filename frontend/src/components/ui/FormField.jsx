export default function FormField({
  id,
  label,
  required,
  hint,
  error,
  children,
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-800 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-600 text-xs font-semibold">*</span>}
        </label>
      )}

      {children}

      {hint && (
        <p className="text-xs text-slate-600" id={id ? `${id}-hint` : undefined}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 font-medium" id={id ? `${id}-error` : undefined}>
          {error}
        </p>
      )}
    </div>
  );
}

{/* <FormField id="fullName" label="Full Name" required>
  <input id="fullName" className="input" ... />
</FormField> */}