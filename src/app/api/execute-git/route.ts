import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  let workDir = '';
  
  try {
    const { username, token, owner, repo, customText } = await request.json();

    // 验证输入
    if (!username || !token || !owner || !repo) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 创建临时工作目录
    workDir = path.join(process.cwd(), 'temp', `${owner}-${repo}-${Date.now()}`);
    mkdirSync(workDir, { recursive: true });

    console.log('Working directory:', workDir);
    console.log('Target repository:', `${owner}/${repo}`);

    try {
      // 执行Git命令 - 确保所有操作都在临时目录中
      const commands = [
        `git clone https://${username}:${token}@github.com/${owner}/${repo}.git .`,
        `git checkout -b update-readme-${Date.now()}`,
        `echo "# This is the System" >> README.md`,
        `echo "${customText || 'Successfully connected!'}" >> README.md`,
        `git add README.md`,
        `git commit -m "Update README.md: Add new section"`,
        `git push origin update-readme-${Date.now()}`,
        `gh pr create --title "Update README.md" --body "Added a new section to the README"`
      ];

      const results = [];
      
      for (const command of commands) {
        try {
          console.log('Executing command:', command);
          console.log('Command working directory:', workDir);
          
          const output = execSync(command, { 
            cwd: workDir, // 确保在临时目录中执行
            encoding: 'utf8',
            timeout: 30000, // 30秒超时
            env: {
              ...process.env,
              GIT_CONFIG_GLOBAL: '/dev/null', // 禁用全局Git配置
              GIT_CONFIG_SYSTEM: '/dev/null'  // 禁用系统Git配置
            }
          });
          results.push({ command, success: true, output });
          console.log('Command succeeded:', command);
        } catch (error: any) {
          console.error('Command failed:', command, error.message);
          results.push({ 
            command, 
            success: false, 
            error: error.message,
            output: error.stdout?.toString() || ''
          });
        }
      }

      return NextResponse.json({
        success: true,
        results,
        workDir
      });

    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  } finally {
    // 清理临时目录（可选，用于调试时可以注释掉）
    // if (workDir && existsSync(workDir)) {
    //   rmSync(workDir, { recursive: true, force: true });
    // }
  }
}
