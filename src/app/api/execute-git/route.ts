import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  let tempDir: string | null = null;

  try {
    console.log('=== 🚀 RUN-GIT START ===');
    const body = await request.json();
    const { username, token, owner, repo } = body;

    if (!username || !token || !owner || !repo) {
      return NextResponse.json({ 
        error: 'Missing required parameters', 
        details: { username, token, owner, repo } 
      }, { status: 400 });
    }

    // Create unique temp directory
    tempDir = path.join(os.tmpdir(), `flowcode-${owner}-${repo}-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
    console.log('📁 Temp directory created:', tempDir);

    const gitUrl = `https://${encodeURIComponent(username)}:${encodeURIComponent(token)}@github.com/${owner}/${repo}.git`;

    // Clone repository
    console.log('📥 Cloning repository...');
    execSync(`git clone ${gitUrl} .`, { cwd: tempDir, stdio: 'pipe' });

    // Setup Git identity
    execSync(`git config user.name "FlowCode Bot"`, { cwd: tempDir });
    execSync(`git config user.email "bot@flowcode.dev"`, { cwd: tempDir });

    // Create new branch
    const newBranch = `flowcode-${Date.now()}`;
    execSync(`git checkout -b ${newBranch}`, { cwd: tempDir });
    console.log(`🌿 Created branch: ${newBranch}`);

    // Modify README as example
    const readmePath = path.join(tempDir, 'README.md');
    fs.appendFileSync(readmePath, `\n\n🚀 Updated by FlowCode (${new Date().toISOString()})\n`);

    // Commit & push
    execSync(`git add .`, { cwd: tempDir });
    execSync(`git commit -m "FlowCode initial automation update"`, { cwd: tempDir });
    execSync(`git push origin ${newBranch}`, { cwd: tempDir });

    console.log('✅ Git push successful');
    console.log('=== ✅ RUN-GIT SUCCESS ===');

    return NextResponse.json({
      success: true,
      username,
      token,
      owner,
      repo,
      branch: newBranch,
      workDir: tempDir, // persisted for later steps
    });

  } catch (err: any) {
    console.error('❌ RUN-GIT ERROR:', err);
    return NextResponse.json({
      error: 'RUN-GIT failed',
      message: err?.message || String(err),
      stack: err?.stack || null
    }, { status: 500 });
  }

  // ⚠️ Cleanup intentionally skipped
}
