require('dotenv').config();
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  const parentEnvPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(parentEnvPath)) {
    require('dotenv').config({ path: parentEnvPath });
  }
}

const config = {
  port: process.env.PORT || '8080',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  mode: process.env.MODE || 'development',
  defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL || 'https://ui-avatars.com/api/?background=E5E7EB&color=9CA3AF&name=Guest'
};

module.exports = config;
