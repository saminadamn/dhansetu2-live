export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-govBlue text-white hover:bg-blue-800 focus:ring-govBlue focus:ring-offset-slate-100",
    secondary:
      "bg-white text-govBlue border border-govBlue hover:bg-govSoftBlue focus:ring-govBlue focus:ring-offset-slate-100",
    subtle:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400 focus:ring-offset-slate-100",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}