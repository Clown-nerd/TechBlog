'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface AutoSaveOptions {
  key: string;
  data: any;
  intervalMs?: number;
}

/**
 * Auto-saves data to localStorage every `intervalMs` (default 30 s).
 * Returns { hasDraft, loadDraft, clearDraft, lastSavedAt }.
 */
export function useAutoSave({ key, data, intervalMs = 30_000 }: AutoSaveOptions) {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Save to localStorage
  const save = useCallback(() => {
    try {
      localStorage.setItem(key, JSON.stringify(dataRef.current));
      setLastSavedAt(new Date());
    } catch {
      // localStorage might be full or blocked
    }
  }, [key]);

  // Interval auto-save
  useEffect(() => {
    const id = setInterval(save, intervalMs);
    return () => clearInterval(id);
  }, [save, intervalMs]);

  // Check if a draft exists
  const hasDraft = useCallback((): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }, [key]);

  // Load a saved draft
  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [key]);

  // Clear the draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // noop
    }
  }, [key]);

  return { save, hasDraft, loadDraft, clearDraft, lastSavedAt };
}
