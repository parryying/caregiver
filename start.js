#!/usr/bin/env node

// Startup script for cloud deployment
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Starting Caregiver App...');
console.log('📁 Working Directory:', process.cwd());
console.log('🔧 Node Version:', process.version);
console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
console.log('📡 Port:', process.env.PORT || 3000);

// Change to backend directory and start server
const backendPath = path.join(__dirname, 'backend');
console.log('📂 Backend Path:', backendPath);

process.chdir(backendPath);
console.log('✅ Changed to backend directory');

// Start the server
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: process.env
});

server.on('error', (err) => {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`🔄 Server exited with code: ${code}`);
    process.exit(code);
});

console.log('🎯 Server started with PID:', server.pid);