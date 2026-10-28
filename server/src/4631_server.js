const app = require('./4631_app');
const connectDB = require('./config/4631_db');
const env = require('./config/4631_env');
const mongoose = require('mongoose');
const { exec } = require('child_process');

let server;

// Helper to open Swagger page in the default web browser automatically
const openBrowser = (url) => {
  if (process.env.NODE_ENV === 'test' || process.env.AUTO_OPEN_BROWSER === 'false') {
    return;
  }

  let command = '';
  switch (process.platform) {
    case 'win32':
      command = `start "" "${url}"`;
      break;
    case 'darwin':
      command = `open "${url}"`;
      break;
    default:
      command = `xdg-open "${url}"`;
      break;
  }

  // Allow a brief moment for the HTTP server to accept inbound socket connections
  setTimeout(() => {
    exec(command, (err) => {
      if (err) {
        console.warn(`[Swagger] Could not auto-launch browser: ${err.message}`);
      } else {
        console.log(`[Swagger] Successfully opened Swagger UI in default browser: ${url}`);
      }
    });
  }, 600);
};

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const docsUrl = `http://localhost:${env.PORT}/api/docs`;

  // Start HTTP Server
  server = app.listen(env.PORT, () => {
    console.log(`====================================================`);
    console.log(` HAS REST API Server running on port ${env.PORT}`);
    console.log(` Environment:  ${env.NODE_ENV}`);
    console.log(` Health check: http://localhost:${env.PORT}/api/health`);
    console.log(` Swagger Docs: ${docsUrl}`);
    console.log(`====================================================`);

    // Automatically open Swagger Documentation in browser
    openBrowser(docsUrl);
  });
};

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      mongoose.connection.close(false).then(() => {
        console.log('[Server] MongoDB connection closed.');
        process.exit(0);
      }).catch(err => {
        console.error('[Server Error] Error during MongoDB disconnection:', err);
        process.exit(1);
      });
    });

    // Force shutdown after 10s if connections fail to drain
    setTimeout(() => {
      console.error('[Server Error] Forceful shutdown initiated after timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

module.exports = server;
