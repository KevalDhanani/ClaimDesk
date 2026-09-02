"use client";

import { useCallback, useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { recoveryApi } from "@/lib/api/client";
import type { Activity, FoundItemPublic, RecoveryCase } from "@/lib/domain/types";
import { getClientDb, isFirebaseClientConfigured } from "@/lib/firebase/client";

export function useCaseLive(caseId: string) {
  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [candidates, setCandidates] = useState<FoundItemPublic[]>([]);
  const [selectedItem, setSelectedItem] = useState<FoundItemPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await recoveryApi.getCase(caseId);
      setRecoveryCase(data.recoveryCase);
      setActivities(data.activities);
      setCandidates(data.candidates);
      setSelectedItem(data.selectedItem);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    refresh();

    if (isFirebaseClientConfigured()) {
      const db = getClientDb();
      if (db) {
        const unsubCase = onSnapshot(doc(db, "recoveryCases", caseId), () => {
          refresh();
        });
        const activitiesQuery = query(
          collection(db, "activities"),
          where("recoveryCaseId", "==", caseId)
        );
        const unsubActivities = onSnapshot(activitiesQuery, () => {
          refresh();
        });
        return () => {
          unsubCase();
          unsubActivities();
        };
      }
    }

    const id = window.setInterval(refresh, 2000);
    return () => window.clearInterval(id);
  }, [caseId, refresh]);

  return {
    recoveryCase,
    activities,
    candidates,
    selectedItem,
    error,
    loading,
    refresh,
  };
}
