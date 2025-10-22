// src/app/api/app.js
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// 示例路由
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Priscilla' }]);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
