import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PublicDataSnapshot } from "../types/publicData";
import {
  buildEnvelope,
  clearPublicDataCache,
  createSnapshotHash,
  loadPublicDataFromStorage,
  savePublicDataToStorage,
} from "../utils/publicData/cache";
import { fetchPublicData } from "../utils/publicData/fetchPublicData";

type PublicDataStatus = "blocking-load" | "ready" | "error";
type InitialSource = "network" | "cache" | "none";

interface PublicDataContextValue {
  data: PublicDataSnapshot | null;
  status: PublicDataStatus;
  initialSource: InitialSource;
  showHydrationFade: boolean;
  isSyncing: boolean;
  isSwappingData: boolean;
  lastUpdatedAt: string | null;
  errorMessage: string | null;
  syncNow: () => Promise<void>;
}

export const PublicDataContext = createContext<PublicDataContextValue | null>(null);

interface PublicDataProviderProps {
  children: ReactNode;
}

export const PublicDataProvider = ({ children }: PublicDataProviderProps) => {
  const [data, setData] = useState<PublicDataSnapshot | null>(null);
  const [status, setStatus] = useState<PublicDataStatus>("blocking-load");
  const [initialSource, setInitialSource] = useState<InitialSource>("none");
  const [showHydrationFade, setShowHydrationFade] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSwappingData, setIsSwappingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const dataHashRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  const hasInconsistentSnapshot = useCallback((snapshot: PublicDataSnapshot) => {
    const referencedTeamIds = new Set<string>();

    snapshot.firstStageGroups.forEach((group) => {
      (group.teams?.teams || []).forEach((team) => {
        if (team.id) referencedTeamIds.add(team.id);
      });
    });

    snapshot.secondStageGroups.forEach((group) => {
      (group.teams?.teams || []).forEach((team) => {
        if (team.id) referencedTeamIds.add(team.id);
      });
    });

    snapshot.finalStageMatches.forEach((match) => {
      if (match.home_team_id) referencedTeamIds.add(match.home_team_id);
      if (match.away_team_id) referencedTeamIds.add(match.away_team_id);
    });

    const hasTeamReferences = referencedTeamIds.size > 0;
    const hasNoCoreData =
      snapshot.teams.length === 0 &&
      snapshot.matches.length === 0 &&
      snapshot.players.length === 0;

    return hasNoCoreData && hasTeamReferences;
  }, []);

  const hasEmptyCoreSnapshot = useCallback((snapshot: PublicDataSnapshot) => {
    return (
      snapshot.teams.length === 0 &&
      snapshot.matches.length === 0 &&
      snapshot.players.length === 0
    );
  }, []);

  const applySnapshot = useCallback((snapshot: PublicDataSnapshot, fetchedAt: string, isBackgroundUpdate: boolean) => {
    const nextHash = createSnapshotHash(snapshot);

    if (dataHashRef.current === nextHash) {
      return;
    }

    dataHashRef.current = nextHash;

    if (isBackgroundUpdate) {
      setIsSwappingData(true);
      window.setTimeout(() => {
        if (isMountedRef.current) {
          setIsSwappingData(false);
        }
      }, 240);
    }

    setData(snapshot);
    setLastUpdatedAt(fetchedAt);
  }, []);

  const syncFromNetwork = useCallback(async (isBackgroundUpdate: boolean): Promise<boolean> => {
    setIsSyncing(true);

    try {
      const result = await fetchPublicData();
      if (result.warnings.length > 0) {
        console.warn("Public data sync warnings:", result.warnings);
      }

      if (hasInconsistentSnapshot(result.snapshot)) {
        throw new Error("Pobrano niespojny zestaw danych. Brak danych podstawowych przy istniejacych referencjach.");
      }

      const envelope = buildEnvelope(result.snapshot, result.fetchedAt);
      savePublicDataToStorage(envelope);
      applySnapshot(result.snapshot, result.fetchedAt, isBackgroundUpdate);
      setErrorMessage(null);
      setStatus("ready");
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Public data sync failed:", error);

      if (!data) {
        setStatus("error");
        setErrorMessage(`Nie mozna pobrac danych startowych: ${message}`);
      }

      return false;
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  }, [applySnapshot, data, hasInconsistentSnapshot]);

  const syncNow = useCallback(async () => {
    await syncFromNetwork(true);
  }, [syncFromNetwork]);

  useEffect(() => {
    isMountedRef.current = true;

    const hydrate = async () => {
      const cached = loadPublicDataFromStorage();

      if (cached && !hasInconsistentSnapshot(cached.data) && !hasEmptyCoreSnapshot(cached.data)) {
        setInitialSource("cache");
        setStatus("ready");
        setShowHydrationFade(true);
        applySnapshot(cached.data, cached.fetchedAt, false);

        window.setTimeout(() => {
          if (isMountedRef.current) {
            setShowHydrationFade(false);
          }
        }, 320);

        // Background sync after paint to avoid blocking initial render.
        window.setTimeout(() => {
          if (isMountedRef.current) {
            void syncFromNetwork(true);
          }
        }, 60);

        return;
      }

      if (cached) {
        clearPublicDataCache();
      }

      setInitialSource("network");
      setStatus("blocking-load");
      await syncFromNetwork(false);
    };

    void hydrate();

    return () => {
      isMountedRef.current = false;
    };
  }, [applySnapshot, hasEmptyCoreSnapshot, hasInconsistentSnapshot, syncFromNetwork]);

  const value = useMemo<PublicDataContextValue>(
    () => ({
      data,
      status,
      initialSource,
      showHydrationFade,
      isSyncing,
      isSwappingData,
      lastUpdatedAt,
      errorMessage,
      syncNow,
    }),
    [
      data,
      status,
      initialSource,
      showHydrationFade,
      isSyncing,
      isSwappingData,
      lastUpdatedAt,
      errorMessage,
      syncNow,
    ]
  );

  return (
    <PublicDataContext.Provider value={value}>
      {children}
    </PublicDataContext.Provider>
  );
};
