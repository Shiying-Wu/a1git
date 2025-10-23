'use client';

import { useState } from 'react';

type UserInput = {
  name: string;
  lineStatus: 'offline' | 'online';
};

export default function SequelizePage() {
  const [users, setUsers] = useState<UserInput[]>([
    { name: 'abcccc', lineStatus: 'offline' },
  ]);
  const [commands, setCommands] = useState<string>('');

  const handleChange = (index: number, field: keyof UserInput, value: string) => {
    const newUsers = [...users];
    newUsers[index][field] = value as any;
    setUsers(newUsers);
  };

  const addUser = () => {
    setUsers([...users, { name: '', lineStatus: 'offline' }]);
  };

  const removeUser = (index: number) => {
    const newUsers = [...users];
    newUsers.splice(index, 1);
    setUsers(newUsers);
  };

  const generateCommands = () => {
    const enumValues = Array.from(new Set(users.map(u => u.lineStatus))).map(s => `'${s}'`).join(',');

    const userModel = `
const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  lineStatus: DataTypes.ENUM(${enumValues})
});

module.exports = User;
`.trim();

    const sequelizeLib = `
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite'
});

module.exports = sequelize;
`.trim();

    const shellCommands = `
# Install dependencies
npm install sequelize sqlite3

# Create folders
mkdir -p models lib

# Create model file
echo "${userModel.replace(/\n/g, '\\n').replace(/"/g, '\\"')}" > models/user.js

# Create sequelize lib
echo "${sequelizeLib.replace(/\n/g, '\\n').replace(/"/g, '\\"')}" > lib/sequelize.js
`;

    setCommands(shellCommands.trim());
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Sequelize CRUD Command Generator</h1>

      <div style={{ marginTop: 20 }}>
        <h3>Enter Sample Users</h3>
        {users.map((user, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="username"
              value={user.name}
              onChange={e => handleChange(idx, 'name', e.target.value)}
            />
            <select
              value={user.lineStatus}
              onChange={e => handleChange(idx, 'lineStatus', e.target.value)}
            >
              <option value="offline">offline</option>
              <option value="online">online</option>
            </select>
            <button onClick={() => removeUser(idx)}>Remove</button>
          </div>
        ))}

        <button onClick={addUser} style={{ marginTop: 10 }}>
          Add User
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <button onClick={generateCommands}>Generate Commands</button>
      </div>

      {commands && (
        <div style={{ marginTop: 20 }}>
          <h3>Copy & Paste These Commands in Terminal</h3>
          <pre style={{ backgroundColor: '#0b0000ff', padding: 10 }}>{commands}</pre>
        </div>
      )}
    </div>
  );
}
