'use client';

import { useState, useEffect } from 'react';
import HamburgerMenu from '../Components/HamburgerMenu';
import { useGitData } from '../context/GitDataContext';

export default function DockerPage() {
  const { gitData } = useGitData();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  // 防止hydration错误
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log('Docker page - gitData:', gitData);
      console.log('Docker page - localStorage data:', localStorage.getItem('gitGeneratorData'));
    }
  }, [gitData, mounted]);

  // 在mounted之前显示loading
  if (!mounted) {
    return (
      <>
        <div className="centered-heading">
          <h1>Docker Integration for Automated DevOps Workflows</h1>
        </div>
        <div className="aligned-description">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  const generateDockerfile = () => `# Dockerfile
FROM node:lts
RUN apt-get update && apt-get install -y python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]`;

  const generateDockerCompose = () => `version: "3.8"
services:
  frontend:
    build: ./frontend
    ports:
      - "80:3000"
    depends_on:
      - api
    environment:
      - NODE_ENV=development
    volumes:
      - ./frontend:/app
    command: npm run dev

  api:
    build: ./api
    ports:
      - "4080:3000"
    depends_on:
      - sqlite
    environment:
      - NODE_ENV=development
    volumes:
      - ./api:/app
      - sqlite_data:/app/sqlite
    command: sh -c "npx sequelize-cli db:migrate && npm run dev"

  sqlite:
    image: alpine
    container_name: sqlite-volume-holder
    volumes:
      - sqlite_data:/sqlite
    command: ["sh", "-c", "while true; do sleep 1000; done"]

volumes:
  sqlite_data:`;

  const createAndCommit = async () => {
    if (!gitData || !gitData.owner || !gitData.repo || !gitData.username || !gitData.token) {
      alert('Missing saved credentials. Generate on Home first.');
      return;
    }

    setBusy(true);
    setResult(null);

    const files = [
      { path: 'Dockerfile', content: generateDockerfile() },
      { path: 'docker-compose.yml', content: generateDockerCompose() },
    ];

    console.log('Files to be created:', files);
    console.log('Git data being sent:', {
      username: gitData.username,
      owner: gitData.owner,
      repo: gitData.repo,
      hasToken: !!gitData.token
    });

    try {
      console.log('🚀 Sending API request...');
      const resp = await fetch('/api/dockerize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: gitData.username.trim(),
          token: gitData.token.trim(),
          owner: gitData.owner.trim(),
          repo: gitData.repo.trim(),
          files
        })
      });

      console.log('📡 API Response status:', resp.status);
      const json = await resp.json();
      console.log('📄 API Response body:', json);
      
      setResult(json);
      if (resp.ok) {
        alert('✅ Success! Created branch and PR: ' + json.pr);
      } else {
        console.error('❌ API Error:', json);
        alert('❌ Error: ' + (json.error || 'Unknown error') + '\nDetails: ' + (json.details || ''));
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
    <>
      {/* 标题部分 */}
      <div className="centered-heading">
        <h1>
          Docker Integration for Automated DevOps Workflows
        </h1>
      </div>

      {/* 描述部分 */}
      <div className="aligned-description">
        <p>
          This module generates Dockerfile and docker-compose.yml templates for your frontend and API services,
          then commits them to GitHub in a new branch with a pull request.
        </p>
      </div>

      {/* 主功能部分 */}
      <div style={{ padding: 20 }}>
        {gitData ? (
          <div style={{ marginBottom: '20px' }}>
            <section style={{ 
              backgroundColor: '#e8f5e8', 
              padding: '15px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #4caf50'
            }}>
              <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>✅ GitHub Repository Connected</h3>
              <div style={{ fontSize: '14px', color: '#2e7d32' }}>
                <strong>Owner:</strong> {gitData.owner} | <strong>Repo:</strong> {gitData.repo} | <strong>User:</strong> {gitData.username}
              </div>
            </section>

          </div>
        ) : (
          <div style={{ 
            padding: '20px', 
            border: '2px dashed #ccc', 
            borderRadius: '8px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>⚠️ No GitHub Data Found</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Please go to the <strong>Home</strong> page first and generate your Git commands with your GitHub credentials.
            </p>
            <p style={{ color: '#888', fontSize: '14px' }}>
              The data will be automatically saved and available here for Docker operations.
            </p>
          </div>
        )}

        {/* Always visible button section */}
        <div style={{ 
          textAlign: 'center',
          padding: '20px',
          backgroundColor: gitData ? '#f0f8ff' : '#fff3e0',
          borderRadius: '8px',
          border: `1px solid ${gitData ? '#2196f3' : '#ff9800'}`
        }}>
          <h3 style={{ color: gitData ? '#1976d2' : '#f57c00', margin: '0 0 15px 0' }}>
            {gitData ? 'Ready to Deploy?' : 'Generate Docker Files'}
          </h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            {gitData 
              ? 'This will create a new branch, commit the Docker files, and create a pull request.'
              : 'This will generate Dockerfile and docker-compose.yml files. You can save them locally or commit to GitHub if you have credentials set up.'
            }
          </p>
          <button 
            onClick={createAndCommit} 
            disabled={busy}
            style={{
              backgroundColor: busy ? '#ccc' : (gitData ? '#2196f3' : '#ff9800'),
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: busy ? 'not-allowed' : 'pointer',
              minWidth: '200px'
            }}
          >
            {busy ? '⏳ Working...' : '🚀 Generate & Commit Docker Setup'}
          </button>
        </div>

        {/* Results section - always visible when there are results */}
        {result && result.success && (
          <section style={{ 
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            border: '1px solid #4caf50'
          }}>
            <h4 style={{ color: '#2e7d32', margin: '0 0 15px 0' }}>✅ Success! Pull Request Created</h4>
            <p style={{ marginBottom: '15px' }}>
              <a 
                href={result.pr} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#1976d2',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                🔗 View Pull Request on GitHub
              </a>
            </p>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <strong>Branch:</strong> {result.branch}<br/>
              <strong>PR URL:</strong> {result.pr}
            </div>
          </section>
        )}

        {result && result.error && (
          <section style={{ 
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            border: '1px solid #f44336'
          }}>
            <h4 style={{ color: '#c62828', margin: '0 0 15px 0' }}>❌ Error Occurred</h4>
            <div style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '10px', 
              borderRadius: '4px',
              fontSize: '12px',
              color: '#d32f2f'
            }}>
              {typeof result.error === 'string' ? result.error : JSON.stringify(result.error, null, 2)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
