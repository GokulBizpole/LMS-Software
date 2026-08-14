// hooks/useSettings.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getSettings, updateSettings } from "@/services/setting.service";
import type { Setting, UpdateSettingData } from "@/types/setting";

export function useSettings() {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSettings();
      setSettings(result);
    } catch (err) {
      console.error(err);
      setError("Could not load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (payload: UpdateSettingData) => {
    setSaving(true);
    try {
      const result = await updateSettings(payload);
      setSettings(result);
      return result;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    refetch: load,
    save,
  };
}
