'use client';
import { useState } from 'react';
import styles from './GitCommandGenerator.module.css';

export default function DockerGenerator() {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const execute = async () => {
    if (!username || !token || !owner || !repo) {
      alert('请填写所有必需字段');
      return;
    }
    setIsExecuting(true);
    setResult(null);
    try {
      const res = await fetch('/api/generate-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, token, owner, repo, type: 'docker-helper', includeDocker: true })
      });
      const json = await res.json();
      setResult(json);
      if (json.success) alert('Dockerfile/docker-compose 已提交到仓库（查看 PR）。');
      else alert('出错: ' + (json.error || 'unknown'));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Dockerize Next.js</h3>
      <div className={styles.form}>
        <input className={styles.input} placeholder="GitHub Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className={styles.input} placeholder="GitHub Token" type="password" value={token} onChange={e=>setToken(e.target.value)} />
        <input className={styles.input} placeholder="Repo Owner" value={owner} onChange={e=>setOwner(e.target.value)} />
        <input className={styles.input} placeholder="Repo Name" value={repo} onChange={e=>setRepo(e.target.value)} />
        <div className={styles.buttonRow}>
          <button className={styles.executeButton} onClick={execute} disabled={isExecuting}>{isExecuting ? 'Executing...' : 'Generate Dockerfile'}</button>
        </div>
      </div>
      {result && <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}