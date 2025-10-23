'use client';
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

type GitData = {
  username: string;
  token: string;
  owner: string;
  repo: string;
  branch?: string;        // ✅ 新增字段
  workDir?: string; 
  customText?: string;
  commands?: string;
};

type GitDataContextType = {
  gitData: GitData | null;
  setGitData: (data: GitData) => void;
  clearGitData: () => void;
};

const GitDataContext = createContext<GitDataContextType | undefined>(undefined);

export const GitDataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with data from cookies immediately
  const [gitData, setGitData] = useState<GitData | null>(() => {
    if (typeof window !== 'undefined') {
      return getCookie('gitData');
    }
    return null;
  });

  // Save to cookies whenever gitData changes
  useEffect(() => {
    if (gitData) {
      setCookie('gitData', gitData, 30); // 30 days expiry
      console.log('Saved gitData to cookies:', gitData);
    }
  }, [gitData]);

  const clearGitData = () => {
    setGitData(null);
    deleteCookie('gitData');
  };

  return (
    <GitDataContext.Provider value={{ gitData, setGitData, clearGitData }}>
      {children}
    </GitDataContext.Provider>
  );
};

export const useGitData = () => {
  const context = useContext(GitDataContext);
  if (!context) throw new Error('useGitData must be used within GitDataProvider');
  return context;
};
