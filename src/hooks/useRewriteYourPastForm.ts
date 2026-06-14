import { useState, useEffect } from 'react';
import type { RewriteYourPastFormData } from '../calculators/rewriteYourPastCalculator';

const STORAGE_KEY = 'hjRewritePastWorkbook';

export function useRewriteYourPastForm(initialData?: Partial<RewriteYourPastFormData>) {
  const [formData, setFormData] = useState<Partial<RewriteYourPastFormData>>(initialData || {});
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFormData(parsed);
      }
    } catch (error) {
      console.error('Failed to load form data from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-save to localStorage on changes (after initial load)
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error('Failed to save form data to localStorage:', error);
      }
    }
  }, [formData, isLoading]);

  const updateField = (key: keyof RewriteYourPastFormData, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateFields = (updates: Partial<RewriteYourPastFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const resetForm = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({});
  };

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    isLoading,
  };
}
