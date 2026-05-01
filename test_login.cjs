const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// We will mock the /api/auth/me to return a user so it thinks we are logged in!
const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/api/auth/me', (req, res) => {
  res.json({
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User'
  });
});
app.get('/api/transactions', (req, res) => res.json([]));
app.get('/api/budgets', (req, res) => res.json([]));
app.get('/api/profile', (req, res) => res.json({
  uid: 'test@example.com',
  displayName: 'Test User',
  preferredCurrency: 'USD'
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const server = app.listen(8081, async () => {
  console.log('Server started on 8081');
  const browser = await puppeteer.launch({args: ['--no-sandbox']});
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  await page.goto('http://localhost:8081', {waitUntil: 'networkidle0'});
  console.log('Page loaded');
  await browser.close();
  server.close();
});
