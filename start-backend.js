#!/usr/bin/env node
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

// determine python executable inside virtualenv
const python = os.platform() === 'win32'
  ? path.join(__dirname, 'backend', 'venv', 'Scripts', 'python.exe')
  : path.join(__dirname, 'backend', 'venv', 'bin', 'python');

const args = [
  '-m',
  'uvicorn',
  'main:app',
  '--reload',
  '--host',
  '127.0.0.1',
  '--port',
  '8000',
];

const proc = spawn(python, args, {
  cwd: path.join(__dirname, 'backend', 'app'),
  stdio: 'inherit',
});

proc.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});

proc.on('exit', (code, signal) => {
  if (code !== null) process.exit(code);
  if (signal) process.kill(process.pid, signal);
});
