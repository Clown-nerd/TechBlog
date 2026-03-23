'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchInput({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [val, setVal] = useState(defaultValue);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setVal(searchParams.get('q') ?? '');
  }, [searchParams]);

  const push = (newVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newVal.trim().length >= 2) {
      params.set('q', newVal.trim());
    } else {
      params.delete('q');
    }
    router.replace(`/search?${params.toString()}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setVal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push(v), 300);
  };

  return (
    <div className="search-bar-wrap">
      <span className="search-icon">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        className="search-bar"
        type="search"
        value={val}
        onChange={handleChange}
        placeholder="Search articles, guides, tutorials..."
        autoFocus
      />
    </div>
  );
}
