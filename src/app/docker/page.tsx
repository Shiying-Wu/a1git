'use client';

import { useState, useEffect } from 'react';
import { useGitData } from '../context/GitDataContext';

export default function DockerPage() {
  const { gitData } = useGitData();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration errors
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted) {
      console.log('Docker page - gitData:', gitData);
    }
  }, [gitData, mounted]);

  if (!mounted) {
    return (
      <div className="centered-heading">
        <h1>Docker Integration for Automated DevOps Workflows</h1>
        <p>Loading...</p>
      </div>
    );
  }

  // Dockerfile & Compose templates
  const generateDockerfile = () => `# Dockerfile
FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]`;

  const generateDockerCompose = () => `version: "3.8"
services:
  frontend:
    build: .
    ports:
      - "80:3000"
    volumes:
      - .:/app
    command: npm run dev`;

  const createAndCommit = async () => {
    if (!gitData || !gitData.username || !gitData.token || !gitData.owner || !gitData.repo || !gitData.branch || !gitData.workDir) {
      alert('Missing Git credentials or workspace. Run the Git step first.');
      return;
    }

    setBusy(true);
    setResult(null);

    const files = [
      { path: 'Dockerfile', content: generateDockerfile() },
      { path: 'docker-compose.yml', content: generateDockerCompose() },
    ];

    try {
      console.log('🚀 Sending Dockerize request...');
      const resp = await fetch('/api/dockerize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: gitData.username.trim(),
          token: gitData.token.trim(),
          owner: gitData.owner.trim(),
          repo: gitData.repo.trim(),
          branch: gitData.branch.trim(),
          files,
          workDir: gitData.workDir, // reuse directory
        })
      });

      const json = await resp.json();
      setResult(json);

      if (resp.ok) {
        alert('✅ Docker PR created: ' + json.pr);
      } else {
        console.error('❌ Docker API error:', json);
        alert('❌ Error: ' + (json.message || 'Unknown error'));
      }
    } catch (e: any) {
      console.error('💥 Request failed:', e);
      alert('❌ Request failed: ' + e.message);
      setResult({ error: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Docker Integration for Automated DevOps Workflows</h1>

      {gitData ? (
        <section style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', marginBottom: 20 }}>
          <h3>✅ GitHub Repository Connected</h3>
          <p><strong>Owner:</strong> {gitData.owner} | <strong>Repo:</strong> {gitData.repo} | <strong>Branch:</strong> {gitData.branch}</p>
        </section>
      ) : (
        <section style={{ padding: 20, border: '2px dashed #ccc', borderRadius: 8, textAlign: 'center', marginBottom: 20 }}>
          <h3>⚠️ No GitHub Data Found</h3>
          <p>Please run the Git step first to initialize repository workspace.</p>
        </section>
      )}

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <button 
          onClick={createAndCommit} 
          disabled={busy || !gitData}
          style={{
            backgroundColor: busy ? '#ccc' : '#2196f3',
            color: 'white',
            padding: '12px 24px',
            borderRadius: 6,
            cursor: busy ? 'not-allowed' : 'pointer'
          }}
        >
          {busy ? '⏳ Working...' : '🚀 Generate & Commit Docker Setup'}
        </button>
      </div>

      {result && result.success && (
        <section style={{ backgroundColor: '#e8f5e8', padding: 15, borderRadius: 8 }}>
          <h4>✅ Success! PR Created</h4>
          <a href={result.pr} target="_blank" rel="noopener noreferrer">{result.pr}</a>
          <p><strong>Branch:</strong> {result.branch}</p>
        </section>
      )}

      {result && result.error && (
        <section style={{ backgroundColor: '#ffebee', padding: 15, borderRadius: 8 }}>
          <h4>❌ Error Occurred</h4>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}
