
"use client";
import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '../lib/store';

interface StoreProviderProps {
  children: ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps): JSX.Element {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}
