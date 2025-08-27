// components/HamburgerMenu.tsx
//'use client' directive tells Next.js this is a client-side component.
'use client'

// Import React's special function： useState hook for managing state.
// Import CSS module for styling.
import { useState } from 'react';
import styles from './HamburgerMenu.module.css';


// Define the HamburgerMenu functional component.
// useState是react这个library的hook function: 用于在adjust component's state.
// const [当前状态, 更新状态的函数] = useState(初始状态)：此处当前状态false 
const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to toggle the menu open/closed state.
  const toggleMenu = () => {
    setIsOpen(!isOpen); //即如果当前状态为false（默认），则将其状态更新为true
  };

  // Render the hamburger menu UI.
  return (
    // Main container div, styled using CSS module.
    <div className={styles.container}>
      {/* Hamburger icon, clicking toggles menu open/closed */}
      <div className={styles.hamburger} onClick={toggleMenu}>
        {/* Three bars for the hamburger icon, style changes if menu is open */}
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
        <div className={isOpen ? styles.barOpen : styles.bar}></div>
      </div>

      {/* Navigation menu, style changes if menu is open */}
      <nav className={isOpen ? styles.menuOpen : styles.menu}>
        <ul>
          {/* Menu links */}
          <li><a href="/">Home</a></li>
          <li><a href="/theme">Theme</a></li>
          <li><a href="/docker">Docker</a></li>
          <li><a href="/prima">Prima</a></li>
          <li><a href="/test">Test</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </nav>
    </div>
  );

};

// Export the component as default for use in other files.
export default HamburgerMenu;