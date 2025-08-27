// components/GitCommandGenerator.tsx
'use client'

import { useState } from 'react';
import styles from './GitCommandGenerator.module.css';

const GitCommandGenerator = () => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [customText, setCustomText] = useState('');
  const [commands, setCommands] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  const generateCommands = () => {
    if (!username || !token || !owner || !repo) {
      setCommands('Please fill in all fields before generating commands.');
      return;
    }

    const generatedCommands = `git clone https://${username}:${token}@github.com/${owner}/${repo}.git
cd ${repo}
git checkout -b update-readme
echo "# This is the System" >> README.md
echo "${customText || 'Successfully connected!'}" >> README.md
git add README.md
git commit -m "Update README.md: Add new section"
git push origin update-readme
gh pr create --title "Update README.md" --body "Added a new section to the README"`;
    
    setCommands(generatedCommands);
    setCopied(false);
  };

  const executeCommands = async () => {
    if (!username || !token || !owner || !repo) {
      alert('Please fill in all required fields before executing commands.');
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const response = await fetch('/api/execute-git', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          token,
          owner,
          repo,
          customText
        }),
      });

      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 检查响应内容类型
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }

      const result = await response.json();
      setExecutionResult(result);

      if (result.success) {
        alert('Commands executed successfully! Check the results below.');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Execution error:', error);
      alert(`Failed to execute commands: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
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
        <p className={styles.subtitle}>Generate and execute Git commands for repository operations</p>
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

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Custom Text (Optional)</label>
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Enter custom text for README"
              className={styles.input}
            />
          </div>
        </div>
        
        <div className={styles.buttonRow}>
          <button className={styles.generateButton} onClick={generateCommands}>
            Generate Commands
          </button>
          <button 
            className={`${styles.executeButton} ${isExecuting ? styles.executing : ''}`} 
            onClick={executeCommands}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : 'Execute Commands'}
          </button>
        </div>
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

      {executionResult && (
        <div className={styles.resultsSection}>
          <h3 className={styles.resultsTitle}>Execution Results</h3>
          <div className={styles.results}>
            {executionResult.results?.map((result: any, index: number) => (
              <div key={index} className={`${styles.resultItem} ${result.success ? styles.success : styles.error}`}>
                <div className={styles.commandName}>{result.command}</div>
                <div className={styles.resultStatus}>
                  {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                {result.output && (
                  <pre className={styles.resultOutput}>{result.output}</pre>
                )}
                {result.error && (
                  <div className={styles.resultError}>{result.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GitCommandGenerator;