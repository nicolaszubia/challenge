export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-3 text-[13px] text-[var(--danger)]">
      {children}
    </p>
  );
}
