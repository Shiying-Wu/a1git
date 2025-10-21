import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  let workDir = '';
  try {
    const { username, token, owner, repo, type /* 'prisma'|'sequelize' */, includeDocker } = await request.json();

    if (!username || !token || !owner || !repo || !type) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    workDir = path.join(process.cwd(), 'temp', `${owner}-${repo}-${Date.now()}`);
    mkdirSync(workDir, { recursive: true });

    // write basic templates
    if (type === 'prisma') {
      mkdirSync(path.join(workDir, 'prisma'), { recursive: true });
      writeFileSync(path.join(workDir, 'prisma', 'schema.prisma'), `
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model Item {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  createdAt DateTime @default(now())
}
      `.trim());

      // simple Next.js API route for CRUD (app dir route)
      mkdirSync(path.join(workDir, 'app', 'api', 'items'), { recursive: true });
      writeFileSync(path.join(workDir, 'app', 'api', 'items', 'route.ts'), `
// Minimal Prisma CRUD route (template)
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.item.findMany();
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.item.create({ data: { title: body.title, content: body.content } });
  return NextResponse.json(item);
}

// add PUT/DELETE handlers similarly...
      `.trim());
    } else {
      // sequelize template
      mkdirSync(path.join(workDir, 'models'), { recursive: true });
      writeFileSync(path.join(workDir, 'models', 'item.js'), `
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Item', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING },
    content: { type: DataTypes.TEXT },
  });
};
      `.trim());

      mkdirSync(path.join(workDir, 'app', 'api', 'items'), { recursive: true });
      writeFileSync(path.join(workDir, 'app', 'api', 'items', 'route.ts'), `
// Minimal Sequelize CRUD template (server-side)
import { NextResponse } from 'next/server';
// placeholder: you'd add sequelize initialization file
export async function GET() {
  return NextResponse.json({ message: 'Add Sequelize initialization and model wiring.' });
}
      `.trim());
    }

    if (includeDocker) {
      writeFileSync(path.join(workDir, 'Dockerfile'), `
# Basic Dockerfile for Next.js app
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
      `.trim());

      writeFileSync(path.join(workDir, 'docker-compose.yml'), `
version: '3.8'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  db:
    image: sqlite3
    # For production use a proper DB like postgres
      `.trim());
    }

    // Git operations: clone target repo into workDir, copy files, commit & push
    const cloneDir = workDir + '/repo';
    mkdirSync(cloneDir, { recursive: true });

    // clone (use credentials)
    execSync(`git clone https://${username}:${token}@github.com/${owner}/${repo}.git ${cloneDir}`, { encoding: 'utf8', timeout: 30000 });
    // copy generated files into cloned repo
    execSync(`cp -r ${workDir}/* ${cloneDir}/`, { encoding: 'utf8' });

    const branch = `db/${type}-${Date.now()}`;
    execSync(`cd ${cloneDir} && git checkout -b ${branch}`, { encoding: 'utf8' });
    execSync(`cd ${cloneDir} && git add .`, { encoding: 'utf8' });
    execSync(`cd ${cloneDir} && git commit -m "Add ${type} CRUD templates and docker config" || true`, { encoding: 'utf8' });
    execSync(`cd ${cloneDir} && git push origin ${branch}`, { encoding: 'utf8' });

    // create PR via gh cli if available (best-effort)
    try {
      execSync(`cd ${cloneDir} && gh pr create --title "Add ${type} templates & docker" --body "Auto-generated ${type} CRUD and docker files"`, { encoding: 'utf8' });
    } catch (e) {
      // ignore if gh not configured
    }

    return NextResponse.json({ success: true, branch, workDir });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}