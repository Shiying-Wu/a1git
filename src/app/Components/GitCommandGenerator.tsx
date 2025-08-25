// components/GitCommandGenerator.tsx
'use client'

import { useState } from 'react';
import styles from './GitCommandGenerator.module.css';

const GitCommandGenerator = () => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [commands, setCommands] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCommands = () => {
    if (!username || !token || !owner || !repo) {
      setCommands('Please fill in all fields before generating commands.');
      return;
    }

    const generatedCommands = `git clone https://${username}:${token}@github.com/${owner}/${repo}.git
cd ${repo}
git checkout -b update-readme
echo "# This is the System" >> README.md
echo "Successfully connected!" >> README.md
git add README.md
git commit -m "Update README.md: Add new section"
git push origin update-readme
gh pr create --title "Update README.md" --body "Added a new section to the README"`;
    
    setCommands(generatedCommands);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (commands) {
      navigator.clipboard.writeText(commands);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Git Command Generator</h2>
        <p className={styles.subtitle}>Generate Git commands for repository operations</p>
      </div>
      
      <div className={styles.form}>
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>GitHub Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>GitHub Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxx"
              className={styles.input}
            />
          </div>
        </div>
        
        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Repository Owner</label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="owner-username"
              className={styles.input}
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Repository Name</label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="repository-name"
              className={styles.input}
            />
          </div>
        </div>
        
        <button className={styles.generateButton} onClick={generateCommands}>
          Generate Commands
        </button>
      </div>
      
      {commands && (
        <div className={styles.commandsSection}>
          <div className={styles.commandsHeader}>
            <h3 className={styles.commandsTitle}>Generated Commands</h3>
            <button 
              className={`${styles.copyButton} ${copied ? styles.copied : ''}`} 
              onClick={copyToClipboard}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className={styles.commands}>
            {commands}
          </pre>
        </div>
      )}
    </div>
  );
};

export default GitCommandGenerator;