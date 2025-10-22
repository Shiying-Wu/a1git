import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, token, owner, repo, files } = body;

    if (!username || !token || !owner || !repo || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), `sequelize-${owner}-${repo}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });

    const gitUrl = `https://${encodeURIComponent(username.trim())}:${encodeURIComponent(token.trim())}@github.com/${owner}/${repo}.git`;

    try {
      execSync(`git clone ${gitUrl} .`, { cwd: tempDir, stdio: 'inherit' });
    } catch (err) {
      return NextResponse.json({ error: 'Git clone failed', detail: err.message }, { status: 500 });
    }

    const branch = `add-sequelize-${Date.now()}`;
    execSync(`git checkout -b ${branch}`, { cwd: tempDir, stdio: 'inherit' });

    for (const f of files) {
      const dest = path.join(tempDir, path.normalize(f.path));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, f.content, 'utf8');
    }

    execSync(`git add .`, { cwd: tempDir, stdio: 'inherit' });
    execSync(`git commit -m "Add Sequelize CRUD and Docker setup"`, { cwd: tempDir, stdio: 'inherit' });
    execSync(`git push origin ${branch}`, { cwd: tempDir, stdio: 'inherit' });

    const repoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const repoJson = await repoResp.json();
    const base = repoJson.default_branch || 'main';

    const prResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Add Sequelize CRUD and Docker setup',
        head: branch,
        base,
        body: 'This PR adds Sequelize CRUD implementation and Docker configuration for deployment.'
      })
    });

    const prJson = await prResp.json();
    return NextResponse.json({ success: true, pr: prJson.html_url, branch });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
