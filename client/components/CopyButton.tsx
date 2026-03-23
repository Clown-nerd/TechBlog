'use client';

export default function CopyButton({ targetText = '' }: { targetText?: string }) {
  return (
    <button 
      className="c-copy" 
      onClick={(e) => {
        const btn = e.currentTarget;
        if (targetText) navigator.clipboard.writeText(targetText);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      }}
    >
      Copy
    </button>
  );
}
