'use client';
import { useState } from 'react';
import styles from './GitCommandGenerator.module.css';

export default function DBGenerator() {
  const [type, setType] = useState<'prisma'|'sequelize'>('prisma');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [includeDocker, setIncludeDocker] = useState(true);
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
        body: JSON.stringify({ username, token, owner, repo, type, includeDocker })
      });
      const json = await res.json();
      setResult(json);
      if (json.success) alert('已创建分支并推送到 GitHub（查看结果）。');
      else alert('出错: ' + (json.error || 'unknown'));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <button onClick={() => setType('prisma')} style={{background: type==='prisma' ? '#10b981' : undefined}}>Prisma</button>
        <button onClick={() => setType('sequelize')} style={{background: type==='sequelize' ? '#10b981' : undefined}}>Sequelize</button>
      </div>

      <div className={styles.form}>
        <input className={styles.input} placeholder="GitHub Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className={styles.input} placeholder="GitHub Token" type="password" value={token} onChange={e=>setToken(e.target.value)} />
        <input className={styles.input} placeholder="Repo Owner" value={owner} onChange={e=>setOwner(e.target.value)} />
        <input className={styles.input} placeholder="Repo Name" value={repo} onChange={e=>setRepo(e.target.value)} />
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <label>Include Docker</label>
          <input type="checkbox" checked={includeDocker} onChange={e=>setIncludeDocker(e.target.checked)} />
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.executeButton} onClick={execute} disabled={isExecuting}>{isExecuting ? 'Executing...' : 'Create & Commit'}</button>
        </div>
      </div>

      {result && <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}