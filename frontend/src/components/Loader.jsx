
export default function Loader({ message = "Loading...", fullPage = false }) {
  return (
    <div
      className={fullPage ? "loader-container loader-full-page" : "loader-container"}
      role="status"
      aria-live="polite"
    >
      <div className="loader-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
