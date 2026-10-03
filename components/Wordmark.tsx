export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <span className="wordmark-ham">HAM</span>
      <span className="wordmark-voc">vọc</span>
    </span>
  );
}
