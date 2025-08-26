"use client";

import { useState, useEffect } from "react";
import HamburgerMenu from './HamburgerMenu';
import ModeChange from './modeChange';

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
};

//Initializes the active tab to 'home' by default. ??
export default function Navbar() {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const savedTab = getCookie('activeTab');
    if (savedTab) setActiveTab(savedTab);
  }, []);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    document.cookie = `activeTab=${tabName}; path=/; max-age=86400`;
  };

  const tabs = [
    { name: 'Home', path: '/' },
    { name: 'Theme', path: '/theme' },
    { name: 'Docker', path: '/docker' },
    { name: 'Prima', path: '/prima' },
    { name: 'Test', path: '/test' },
    { name: 'About', path: '/about' },
  ];

  return (
    <div className="header">
      {tabs.map(tab => (
        <a
          key={tab.name}
          href={tab.path}
          className={activeTab.toLowerCase() === tab.name.toLowerCase() ? 'active' : ''}
          onClick={() => handleTabClick(tab.name.toLowerCase())}
        >
          {tab.name}
        </a>
      ))}
      <HamburgerMenu />
      <ModeChange />
    </div>
  );
}
