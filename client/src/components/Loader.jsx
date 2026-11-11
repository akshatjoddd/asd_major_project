export default function Loader({ label, inline = false }) {
  return (
    <div className={`loader ${inline ? 'loader--inline' : ''}`} role="status">
      <span className="loader__dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {label ? <span>{label}</span> : null}
    </div>
  );
}
