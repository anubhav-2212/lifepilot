import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './utils/prisma.js';

const app = createApp();

const startServer = async () => {
  try {
    // Verify DB connectivity on start
    await prisma.$connect();
    console.log('✅ PostgreSQL database connection established successfully.');

    app.listen(env.PORT, () => {
      console.log(`🚀 LifePilot API running in [${env.NODE_ENV}] mode on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();
