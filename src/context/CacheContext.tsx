import React, { createContext, useContext, useState, ReactNode } from 'react';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
};

type CacheContextType = {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  clear: (key?: string) => void;
  has: (key: string) => boolean;
};

const CacheContext = createContext<CacheContextType | null>(null);

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

export const CacheProvider = ({ children }: { children: ReactNode }) => {
  const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map());

  const get = <T,>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      // Entry expired, remove it
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }

    return entry.data as T;
  };

  const set = <T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
      return newCache;
    });
  };

  const clear = (key?: string) => {
    if (key) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
    } else {
      setCache(new Map());
    }
  };

  const has = (key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    return now <= entry.timestamp + entry.ttl;
  };

  const value = { get, set, clear, has };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};