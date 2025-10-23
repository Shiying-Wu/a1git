import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    console.log('=== 🐳 DOCKERIZE START ===');
    const body = await request.json();
    const { username, token, owner, repo, branch, files, workDir } = body;

    // Validate inputs
    if (!username || !token || !owner || !repo || !branch || !files || !workDir) {
      return NextResponse.json({
        error: 'Missing required parameters',
        details: { username, token, owner, repo, branch, filesCount: files?.length, workDir }
      }, { status: 400 });
    }

    if (!fs.existsSync(workDir)) {
      return NextResponse.json({ 
        error: 'Invalid workDir', 
        message: 'Please run the Git step first to generate the repository workspace.' 
      }, { status: 400 });
    }

    console.log('📂 Reusing workDir:', workDir);

    // Ensure correct branch
    execSync(`git checkout ${branch}`, { cwd: workDir, stdio: 'pipe' });

    // Write files
    console.log(`📝 Writing ${files.length} files...`);
    for (const f of files) {
      const dest = path.join(workDir, f.path);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, f.content, 'utf8');
      console.log(`✅ Wrote ${f.path}`);
    }

    // Commit & push changes
    execSync(`git add .`, { cwd: workDir });
    const status = execSync(`git status --porcelain`, { cwd: workDir, encoding: 'utf8' });

    if (status.trim()) {
      execSync(`git commit -m "Add Docker config (automated)"`, { cwd: workDir });
      execSync(`git push origin ${branch}`, { cwd: workDir });
      console.log('✅ Changes pushed');
    } else {
      console.log('⚠️ No changes detected, nothing to commit.');
    }

    // Create PR
    const repoInfoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const repoJson = await repoInfoResp.json();
    const base = repoJson.default_branch || 'main';

    const prResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Add Docker support (FlowCode)',
        head: branch,
        base,
        body: `Automated Docker setup by FlowCode.\n\nFiles added:\n${files.map(f => `- ${f.path}`).join('\n')}`,
      }),
    });

    const prJson = await prResp.json();

    console.log('✅ PR created:', prJson.html_url);
    console.log('=== ✅ DOCKERIZE SUCCESS ===');

    return NextResponse.json({
      success: true,
      pr: prJson.html_url,
      branch,
      username,
      token,
      owner,
      repo,
      workDir, // persisted for potential next steps
    });

  } catch (err: any) {
    console.error('❌ DOCKERIZE ERROR:', err);
    return NextResponse.json({
      error: 'DOCKERIZE failed',
      message: err?.message || String(err),
      stack: err?.stack || null
    }, { status: 500 });
  }

  // ⚠️ Cleanup intentionally skipped to reuse workDir
}
