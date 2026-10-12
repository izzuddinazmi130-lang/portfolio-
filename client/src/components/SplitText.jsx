export default function SplitText({ children, className = "" }) {
  return (
    <span className={`split-text ${className}`} aria-label={children}>
      {children.split(" ").map((word, index) => (
        <span className="split-word" style={{ "--word-index": index }} key={`${word}-${index}`} aria-hidden="true">{word} </span>
      ))}
    </span>
  );
}