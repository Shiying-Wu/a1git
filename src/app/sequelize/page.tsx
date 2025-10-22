'use client';

import { useState } from 'react';
import { useGitData } from '../context/GitDataContext';
import HamburgerMenu from '../Components/HamburgerMenu';

export default function SequelizePage() {
  const { gitData } = useGitData();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateFiles = () => [
    {
      path: 'src/app/api/models/User.js',
      content: `const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING
  });
};`
    },
    {
      path: 'src/app/api/routes/user.js',
      content: `const express = require('express');
const router = express.Router();
const db = require('../models');
const User = db.User;

router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

module.exports = router;`
    },
    {
      path: 'src/app/frontend/pages/users.tsx',
      content: `import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function UsersPage() {
  const { data, error } = useSWR('/api/users', fetcher);
  if (error) return <div>Error loading users</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <ul>
      {data.map((user: any) => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}`
    }
  ];

  const handleCommit = async () => {
    if (!gitData || !gitData.token || !gitData.repo || !gitData.owner) {
      alert('Please generate GitHub credentials on the Home page first.');
      return;
    }

    setBusy(true);
    setResult(null);

    const files = generateFiles();

    try {
      const resp = await fetch('/api/sequelize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: gitData.username,
          token: gitData.token,
          owner: gitData.owner,
          repo: gitData.repo,
          files
        })
      });

      const json = await resp.json();
      setResult(json);
      if (resp.ok) {
        alert('✅ Sequelize CRUD files committed to new branch: ' + json.branch);
      } else {
        alert('❌ Commit failed: ' + JSON.stringify(json));
      }
    } catch (e: any) {
      alert('Request failed: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <HamburgerMenu />

      <div className="centered-heading">
        <h1>Sequelize Integration for Automated DevOps Workflows</h1>
      </div>

      <div className="aligned-description">
        <p>
          This module generates Sequelize CRUD templates and commits them to GitHub in a new branch.
          It’s designed to integrate seamlessly with your Dockerized Next.js application.
        </p>
      </div>

      <div className="aligned-description">
        {!gitData ? (
          <p>No GitHub credentials found. Please generate them on the Home page.</p>
        ) : (
          <>
            <p>
              <strong>GitHub Repository Connected</strong><br />
              Owner: {gitData.owner} | Repo: {gitData.repo} | User: {gitData.username}
            </p>

            <p style={{ marginTop: '20px' }}>
              <strong>Ready to Generate Sequelize CRUD?</strong><br />
              This will create a new branch, commit Sequelize CRUD files, and open a pull request.
            </p>

            <button className="primary-button" onClick={handleCommit} disabled={busy}>
              {busy ? 'Committing...' : 'Generate & Commit Sequelize CRUD'}
            </button>
          </>
        )}

        {result && (
          <pre style={{ marginTop: '20px' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </>
  );
}
