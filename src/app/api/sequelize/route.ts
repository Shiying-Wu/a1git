import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, columns } = body;

  const enumCols = columns.filter(c => c.type === 'enum');
  const enumValues = enumCols.length > 0 ? `'offline','online'` : '';

  // Sequelize model template
  const modelContent = `
const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const ${name} = sequelize.define('${name}', {
${columns.map(c => `  ${c.name}: ${c.type === 'enum' ? `DataTypes.ENUM(${enumValues})` : 'DataTypes.STRING'}`).join(',\n')}
});

module.exports = ${name};
`.trim();

  const libContent = `
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

module.exports = sequelize;
`.trim();

  // Terminal commands
  const commands = `
mkdir -p models lib
echo "${modelContent.replace(/\n/g,'\\n').replace(/"/g,'\\"')}" > models/${name.toLowerCase()}.js
echo "${libContent.replace(/\n/g,'\\n').replace(/"/g,'\\"')}" > lib/sequelize.js
npm install sequelize sqlite3
`;

  return NextResponse.json({ commands });
}
