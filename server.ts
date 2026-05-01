import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

// Local JSON Database Helper
const DB_FILE = path.join(process.cwd(), 'db.json');

interface LocalDB {
  app_users: Record<string, any>;
  transactions: any[];
  budgets: any[];
  users: Record<string, any>;
}

function getDB(): LocalDB {
  if (!fs.existsSync(DB_FILE)) {
    const initial: LocalDB = { app_users: {}, transactions: [], budgets: [], users: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data: LocalDB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Protected middleware for data routes
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) {
      console.warn('Authentication failed: No token cookie found');
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      req.user = decoded;
      next();
    } catch (e) {
      console.warn('Authentication failed: Invalid token');
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const requireVerified = (req: any, res: any, next: any) => {
    // Temporarily disabled verification requirement
    next();
  };

  // API Routes
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
      const db = getDB();
      if (db.app_users[email]) return res.status(400).json({ error: 'User already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      db.app_users[email] = {
        email,
        password: hashedPassword,
        mfaEnabled: false,
        emailVerified: true,
        createdAt: new Date().toISOString()
      };
      saveDB(db);

      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/'
      });
      res.json({ email });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const db = getDB();
      const user = db.app_users[email];
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

      // FOR NOW: MFA is globally disabled by user request. 
      // To re-enable, remove the 'false &&' below.
      if (false && user.mfaEnabled) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.pendingOTP = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
        saveDB(db);
        
        // Simulated Email OTP Delivery
        console.log(`
==================================================
EMAIL SENT TO: ${email}
SUBJECT: Your 2FA Verification Code
BODY: Your one-time password is: ${otp}
This code will expire in 5 minutes.
==================================================
        `);
        return res.json({ mfaRequired: true, email });
      }

      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/'
      });
      res.json({ email, emailVerified: user.emailVerified });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/verify-email', authenticate, async (req: any, res) => {
    const { code } = req.body;
    try {
      const db = getDB();
      const user = db.app_users[req.user.email];
      if (!user) return res.status(404).json({ error: 'User not found' });

      if (user.verificationCode !== code) {
        return res.status(400).json({ error: 'Invalid verification code' });
      }

      user.emailVerified = true;
      delete user.verificationCode;
      saveDB(db);

      res.json({ success: true, email: user.email, emailVerified: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/resend-verification', authenticate, async (req: any, res) => {
    try {
      const db = getDB();
      const user = db.app_users[req.user.email];
      if (!user) return res.status(404).json({ error: 'User not found' });

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationCode = verificationCode;
      saveDB(db);

      // Simulated Verification Email
      console.log(`
==================================================
VERIFICATION EMAIL RESENT TO: ${user.email}
SUBJECT: Verify your FinStream Account
BODY: Your verification code is: ${verificationCode}
==================================================
      `);

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
      const db = getDB();
      const user = db.app_users[email];
      
      if (!user || !user.pendingOTP || user.pendingOTP !== otp) {
        return res.status(401).json({ error: 'Invalid or expired OTP' });
      }

      if (user.otpExpiry < Date.now()) {
        delete user.pendingOTP;
        delete user.otpExpiry;
        saveDB(db);
        return res.status(401).json({ error: 'OTP expired' });
      }

      // Success
      delete user.pendingOTP;
      delete user.otpExpiry;
      saveDB(db);

      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/'
      });
      res.json({ email });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/toggle-mfa', authenticate, async (req: any, res) => {
    const { enabled } = req.body;
    try {
      const db = getDB();
      if (db.app_users[req.user.email]) {
        db.app_users[req.user.email].mfaEnabled = enabled;
        saveDB(db);
        res.json({ success: true, mfaEnabled: enabled });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/auth/mfa-status', authenticate, async (req: any, res) => {
    try {
      const db = getDB();
      const user = db.app_users[req.user.email];
      res.json({ mfaEnabled: !!user?.mfaEnabled });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/'
    });
    res.json({ success: true });
  });

  app.post('/api/auth/change-password', authenticate, async (req: any, res) => {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password too short' });
    try {
      const db = getDB();
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      if (db.app_users[req.user.email]) {
        db.app_users[req.user.email].password = hashedPassword;
        saveDB(db);
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GitHub OAuth Routes
  app.get('/api/auth/github/url', (req, res) => {
    const redirectUri = req.query.redirect_uri as string;
    if (!redirectUri) return res.status(400).json({ error: 'Redirect URI required' });

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || '',
      redirect_uri: redirectUri,
      scope: 'user:email',
      state: Math.random().toString(36).substring(7),
    });

    res.json({ url: `https://github.com/login/oauth/authorize?${params.toString()}` });
  });

  app.get(['/api/auth/github/callback', '/api/auth/github/callback/'], async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    try {
      // 1. Exchange code for access token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }, {
        headers: { Accept: 'application/json' }
      });

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        throw new Error('Failed to obtain access token');
      }

      // 2. Fetch user data from GitHub
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const emailsResponse = await axios.get('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const primaryEmail = emailsResponse.data.find((e: any) => e.primary && e.verified)?.email 
        || emailsResponse.data[0]?.email 
        || `${userResponse.data.login}@github.com`;

      // 3. Create or login user
      const db = getDB();
      if (!db.app_users[primaryEmail]) {
        db.app_users[primaryEmail] = {
          email: primaryEmail,
          githubId: userResponse.data.id,
          displayName: userResponse.data.name || userResponse.data.login,
          photoURL: userResponse.data.avatar_url,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          authProvider: 'github'
        };
        saveDB(db);
      }

      // 4. Set session cookie
      const token = jwt.sign({ email: primaryEmail }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/'
      });

      // 5. Send success message to parent window and close popup
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white;">
            <div style="text-align: center;">
              <h2 style="margin-bottom: 10px;">Authentication Successful</h2>
              <p style="color: #94a3b8;">This window will close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('GitHub OAuth Error:', error.response?.data || error.message);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white;">
            <div style="text-align: center; color: #f87171;">
              <h2>Authentication Failed</h2>
              <p>${error.message}</p>
              <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  // Google OAuth Routes
  app.get('/api/auth/google/url', (req, res) => {
    const redirectUri = req.query.redirect_uri as string;
    if (!redirectUri) return res.status(400).json({ error: 'Redirect URI required' });

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state: Math.random().toString(36).substring(7),
    });

    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  app.get(['/api/auth/google/callback', '/api/auth/google/callback/'], async (req, res) => {
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    try {
      // 1. Exchange code for access token
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}/api/auth/google/callback`,
      });

      const accessToken = tokenResponse.data.access_token;

      // 2. Fetch user data from Google
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const primaryEmail = userResponse.data.email;

      // 3. Create or login user
      const db = getDB();
      if (!db.app_users[primaryEmail]) {
        db.app_users[primaryEmail] = {
          email: primaryEmail,
          googleId: userResponse.data.id,
          displayName: userResponse.data.name,
          photoURL: userResponse.data.picture,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          authProvider: 'google'
        };
        saveDB(db);
      }

      // 4. Set session cookie
      const token = jwt.sign({ email: primaryEmail }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'none',
        path: '/'
      });

      // 5. Send success message to parent window
      res.send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white;">
            <div style="text-align: center;">
              <h2 style="margin-bottom: 10px;">Authentication Successful</h2>
              <p style="color: #94a3b8;">This window will close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
                  setTimeout(() => window.close(), 1000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error('Google OAuth Error:', error.response?.data || error.message);
      res.status(500).send(`
        <html>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: white;">
            <div style="text-align: center; color: #f87171;">
              <h2>Authentication Failed</h2>
              <p>${error.message}</p>
              <button onclick="window.close()" style="margin-top: 20px; padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      const db = getDB();
      const user = db.app_users[decoded.email];
      res.json({ 
        email: decoded.email, 
        uid: decoded.email,
        emailVerified: !!user?.emailVerified,
        displayName: user?.displayName,
        photoURL: user?.photoURL,
        authProvider: user?.authProvider
      });
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Data endpoints
  app.get('/api/transactions', authenticate, requireVerified, async (req: any, res) => {
    try {
      const db = getDB();
      const userTransactions = db.transactions
        .filter(t => t.userId === req.user.email)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(userTransactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/transactions', authenticate, requireVerified, async (req: any, res) => {
    try {
      const { amount, category, date, description, type } = req.body;
      console.log('Incoming transaction request:', { amount, category, date, description, type }, 'User:', req.user.email);
      
      if (amount === undefined || !category || !date || !type) {
        console.error('Missing required fields in transaction:', req.body);
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const db = getDB();
      const newTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: req.user.email,
        amount: Number(amount),
        category,
        date,
        description: description || '',
        type,
        createdAt: new Date().toISOString()
      };
      
      db.transactions = db.transactions || [];
      db.transactions.push(newTransaction);
      saveDB(db);
      console.log('Transaction added successfully. New count:', db.transactions.length);
      res.json({ id: newTransaction.id });
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/transactions/:id', authenticate, requireVerified, async (req: any, res) => {
    try {
      const db = getDB();
      db.transactions = db.transactions.filter(t => t.id !== req.params.id);
      saveDB(db);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/budgets', authenticate, requireVerified, async (req: any, res) => {
    try {
      const db = getDB();
      const userBudgets = db.budgets.filter(b => b.userId === req.user.email);
      res.json(userBudgets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/budgets', authenticate, requireVerified, async (req: any, res) => {
    try {
      const { categoryId, amount, period } = req.body;
      const db = getDB();
      const existingIndex = db.budgets.findIndex(b => 
        b.userId === req.user.email && 
        b.categoryId === categoryId && 
        b.period === period
      );

      if (existingIndex > -1) {
        db.budgets[existingIndex].amount = amount;
        saveDB(db);
        res.json({ id: db.budgets[existingIndex].id });
      } else {
        const newBudget = {
          id: Math.random().toString(36).substr(2, 9),
          userId: req.user.email,
          categoryId,
          amount,
          period,
          createdAt: new Date().toISOString()
        };
        db.budgets.push(newBudget);
        saveDB(db);
        res.json({ id: newBudget.id });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/profile', authenticate, requireVerified, async (req: any, res) => {
    try {
      const db = getDB();
      const profile = db.users[req.user.email];
      if (profile) {
        res.json({ ...profile, uid: req.user.email });
      } else {
        res.json({
          uid: req.user.email,
          username: req.user.email.split('@')[0],
          displayName: req.user.email.split('@')[0],
          photoURL: '',
          preferredCurrency: 'USD'
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/profile', authenticate, requireVerified, async (req: any, res) => {
    try {
      const db = getDB();
      db.users[req.user.email] = {
        ...(db.users[req.user.email] || {}),
        ...req.body,
        userId: req.user.email,
        updatedAt: new Date().toISOString()
      };
      saveDB(db);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite/Static Setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
