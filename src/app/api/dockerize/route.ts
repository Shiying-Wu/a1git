import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  let tempDir: string | null = null;
  
  try {
    console.log('=== 🚀 DOCKERIZE API START ===');
    const body = await request.json();
    const { username, token, owner, repo, files } = body;

    console.log('📥 Request received:', {
      username,
      owner,
      repo,
      filesCount: files?.length,
      files: files?.map(f => ({ path: f.path, contentLength: f.content?.length }))
    });

    if (!username || !token || !owner || !repo || !Array.isArray(files)) {
      console.log('❌ Missing required parameters');
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    tempDir = path.join(os.tmpdir(), `dockerize-${owner}-${repo}-${Date.now()}`);
    console.log('📁 Creating temp directory:', tempDir);
    fs.mkdirSync(tempDir, { recursive: true });

    const gitUrl = `https://${encodeURIComponent(username.trim())}:${encodeURIComponent(token.trim())}@github.com/${owner}/${repo}.git`;
    console.log('🔗 Git URL:', gitUrl.replace(token, '***'));

    // Clone
    console.log('📥 Starting git clone...');
    try {
      const cloneOutput = execSync(`git clone ${gitUrl} .`, { 
        cwd: tempDir, 
        stdio: 'pipe', 
        timeout: 120000,
        encoding: 'utf8'
      });
      console.log('✅ Clone successful');
    } catch (cloneError: any) {
      console.error('❌ Git clone failed:', cloneError.message);
      console.error('Clone stderr:', cloneError.stderr);
      return NextResponse.json({ 
        error: 'Failed to clone repository', 
        details: cloneError.message 
      }, { status: 400 });
    }

    // 设置Git配置
    console.log('⚙️ Setting up Git configuration...');
    try {
      execSync(`git config user.name "FlowCode Bot"`, { cwd: tempDir, stdio: 'pipe' });
      execSync(`git config user.email "bot@flowcode.dev"`, { cwd: tempDir, stdio: 'pipe' });
      console.log('✅ Git configuration set');
    } catch (configError: any) {
      console.warn('⚠️ Git config failed:', configError.message);
    }

    // Create branch
    const branch = `add-docker-${Date.now()}`;
    console.log(`🌿 Creating branch: ${branch}`);
    
    try {
      execSync(`git checkout -b ${branch}`, { cwd: tempDir, stdio: 'pipe' });
      console.log('✅ Branch created successfully');
    } catch (branchError: any) {
      console.error('❌ Branch creation failed:', branchError.message);
      return NextResponse.json({ 
        error: 'Failed to create new branch', 
        details: branchError.message 
      }, { status: 500 });
    }

    // Write files
    console.log(`📝 Writing ${files.length} files...`);
    for (const f of files) {
      const safePath = path.normalize(f.path);
      const dest = path.join(tempDir, safePath);
      console.log(`Writing: ${f.path} -> ${dest}`);
      
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, f.content, { encoding: 'utf8' });
      
      // 验证文件写入
      if (fs.existsSync(dest)) {
        const stats = fs.statSync(dest);
        console.log(`✅ File written: ${f.path} (${stats.size} bytes)`);
      } else {
        console.error(`❌ File write failed: ${f.path}`);
      }
    }

    // 检查文件系统
    console.log('📋 Files in temp directory:');
    try {
      const lsOutput = execSync(`ls -la`, { cwd: tempDir, encoding: 'utf8' });
      console.log(lsOutput);
    } catch (e) {
      console.log('Could not list files');
    }

    // Commit and push
    console.log('💾 Committing and pushing changes...');
    try {
      execSync(`git add .`, { cwd: tempDir, stdio: 'pipe' });
      
      const statusOutput = execSync(`git status --porcelain`, { cwd: tempDir, encoding: 'utf8' });
      console.log('📊 Git status after add:', statusOutput);
      
      if (statusOutput.trim()) {
        execSync(`git commit -m "Add Dockerfile and docker-compose.yml (automated)"`, { cwd: tempDir, stdio: 'pipe' });
        console.log('✅ Successfully committed changes');
      } else {
        console.log('❌ No changes to commit');
        return NextResponse.json({ 
          error: 'No changes were made', 
          details: 'Files might already exist or be identical'
        }, { status: 400 });
      }
    } catch (commitError: any) {
      console.error('❌ Commit failed:', commitError.message);
      return NextResponse.json({ 
        error: 'Failed to commit changes', 
        details: commitError.message 
      }, { status: 500 });
    }

    try {
      execSync(`git push origin ${branch}`, { cwd: tempDir, stdio: 'pipe', timeout: 120000 });
      console.log('✅ Successfully pushed to GitHub');
    } catch (pushError: any) {
      console.error('❌ Push failed:', pushError.message);
      return NextResponse.json({ 
        error: 'Failed to push changes to GitHub', 
        details: pushError.message 
      }, { status: 500 });
    }

    // Determine default branch to target for PR
    console.log('Fetching repository info for PR creation...');
    const repoResp = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (!repoResp.ok) {
      return NextResponse.json({ 
        error: 'Failed to fetch repository info for PR creation', 
        details: `HTTP ${repoResp.status}: ${repoResp.statusText}` 
      }, { status: 500 });
    }
    const repoJson = await repoResp.json();
    const base = repoJson.default_branch || 'main';

    // Create PR
    console.log(`Creating PR: ${branch} -> ${base}`);
    const prResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`, 
        'Content-Type': 'application/json', 
        Accept: 'application/vnd.github+json' 
      },
      body: JSON.stringify({
        title: 'Add Dockerfile and docker-compose.yml (automated)',
        head: branch,
        base,
        body: `This PR adds Dockerfile(s) and docker-compose.yml generated from the FlowCode web UI.

## Files Added:
${files.map(f => `- \`${f.path}\``).join('\n')}

## What this does:
- Sets up Docker containerization for your frontend and API services
- Includes a docker-compose.yml for easy local development
- Ready for deployment and scaling

Generated automatically by FlowCode.`
      })
    });

    const prJson = await prResp.json();
    if (!prResp.ok) {
      console.error('PR creation failed:', prJson);
      return NextResponse.json({ 
        error: 'Failed to create pull request', 
        details: prJson.message || JSON.stringify(prJson) 
      }, { status: 500 });
    }

    console.log(`Successfully created PR: ${prJson.html_url}`);
    console.log('=== ✅ DOCKERIZE API SUCCESS ===');
    return NextResponse.json({ 
      success: true, 
      pr: prJson.html_url, 
      branch,
      prNumber: prJson.number 
    });
    
  } catch (err: any) {
    console.error('=== ❌ DOCKERIZE API ERROR ===', err);
    return NextResponse.json({ 
      error: err?.message || String(err),
      type: 'internal_error'
    }, { status: 500 });
  } finally {
    // Cleanup
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned up: ${tempDir}`);
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
    }
  }
}