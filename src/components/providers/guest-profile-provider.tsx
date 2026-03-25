"use client";

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const ANONYMOUS_NICKNAME_STORAGE_KEY = "study-helper-anonymous-nickname-v1";
const LEGACY_ANONYMOUS_USER_ID_STORAGE_KEY =
  "study-helper-anonymous-user-id-v1";

type GuestProfileContextValue = {
  anonymousNickname: string;
  isHydrated: boolean;
  saveAnonymousNickname: (nextAnonymousNickname: string) => void;
  clearAnonymousNickname: () => void;
};

const GuestProfileContext = createContext<GuestProfileContextValue | null>(null);

type GuestProfileProviderProps = {
  children: ReactNode;
};

export function GuestProfileProvider({
  children,
}: GuestProfileProviderProps) {
  const [anonymousNickname, setAnonymousNickname] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedAnonymousNickname =
        window.localStorage.getItem(ANONYMOUS_NICKNAME_STORAGE_KEY) ??
        window.localStorage.getItem(LEGACY_ANONYMOUS_USER_ID_STORAGE_KEY);

      if (storedAnonymousNickname) {
        setAnonymousNickname(storedAnonymousNickname);
        window.localStorage.setItem(
          ANONYMOUS_NICKNAME_STORAGE_KEY,
          storedAnonymousNickname,
        );
        window.localStorage.removeItem(LEGACY_ANONYMOUS_USER_ID_STORAGE_KEY);
      }
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const value = useMemo<GuestProfileContextValue>(
    () => ({
      anonymousNickname,
      isHydrated,
      saveAnonymousNickname(nextAnonymousNickname) {
        const sanitizedAnonymousNickname = nextAnonymousNickname.trim();

        setAnonymousNickname(sanitizedAnonymousNickname);
        window.localStorage.setItem(
          ANONYMOUS_NICKNAME_STORAGE_KEY,
          sanitizedAnonymousNickname,
        );
        window.localStorage.removeItem(LEGACY_ANONYMOUS_USER_ID_STORAGE_KEY);
      },
      clearAnonymousNickname() {
        setAnonymousNickname("");
        window.localStorage.removeItem(ANONYMOUS_NICKNAME_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_ANONYMOUS_USER_ID_STORAGE_KEY);
      },
    }),
    [anonymousNickname, isHydrated],
  );

  return (
    <GuestProfileContext.Provider value={value}>
      {children}
    </GuestProfileContext.Provider>
  );
}

export function useGuestProfile() {
  const context = useContext(GuestProfileContext);

  if (!context) {
    throw new Error("useGuestProfile must be used within GuestProfileProvider.");
  }

  return context;
}
