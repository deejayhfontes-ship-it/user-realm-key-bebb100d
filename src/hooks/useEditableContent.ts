import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fontes_home_content';

interface ContentMap {
  [key: string]: string;
}

// Global state to share across components
let globalContent: ContentMap = {};
let globalListeners: Set<() => void> = new Set();
let globalEditingId: string | null = null;
let editingListeners: Set<() => void> = new Set();

// Load from localStorage on init
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      globalContent = JSON.parse(saved);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  }
}

export function useEditableContent() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    globalListeners.add(listener);
    editingListeners.add(listener);
    return () => {
      globalListeners.delete(listener);
      editingListeners.delete(listener);
    };
  }, []);

  const saveContent = useCallback((key: string, value: string) => {
    globalContent = { ...globalContent, [key]: value };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalContent));
    globalListeners.forEach(l => l());
  }, []);

  const setIsEditing = useCallback((id: string | null) => {
    globalEditingId = id;
    editingListeners.forEach(l => l());
  }, []);

  const getContent = useCallback((key: string, defaultValue: string) => {
    return globalContent[key] || defaultValue;
  }, []);

  const resetAll = useCallback(() => {
    globalContent = {};
    localStorage.removeItem(STORAGE_KEY);
    globalListeners.forEach(l => l());
  }, []);

  return {
    content: globalContent,
    getContent,
    saveContent,
    isEditing: globalEditingId,
    setIsEditing,
    resetAll
  };
}
