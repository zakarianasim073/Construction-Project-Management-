import express from 'express';
import mongoose from 'mongoose';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import jwt from 'jsonwebtoken';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Connect to MongoDB
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/buildtrack_db';
  let isMongoConnected = false;
  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 2000 });
    isMongoConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB, falling back to in-memory store', error.message);
  }

  // --- GENERIC NOSQL API ROUTES ---
  // To smoothly transition from offline localStorage, we expose a generic collection API
  const inMemoryDB: Record<string, any[]> = {};

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', db: isMongoConnected ? mongoose.connection.readyState : 'in-memory' });
  });

  // --- AUTH ROUTES ---
  const JWT_SECRET = process.env.JWT_SECRET || '5aeb6c98c7622543d05e89904d09aed7b33f45a616204b31d4a18de8397c3e7d';

  app.post('/api/auth/login', async (req, res) => {
    const { name, email, role } = req.body;
    if (!email || !name) return res.status(400).json({ error: "Name and email required" });

    try {
      let user;
      if (!isMongoConnected) {
        if (!inMemoryDB['users']) inMemoryDB['users'] = [];
        user = inMemoryDB['users'].find(u => u.email === email);
        if (!user) {
          user = { id: `user-${Date.now()}`, uid: `user-${Date.now()}`, name, email, role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, createdAt: new Date().toISOString() };
          inMemoryDB['users'].push(user);
        }
      } else {
        user = await mongoose.connection.db.collection('users').findOne({ email });
        if (!user) {
           user = { id: `user-${Date.now()}`, uid: `user-${Date.now()}`, name, email, role, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, createdAt: new Date().toISOString() };
           await mongoose.connection.db.collection('users').insertOne(user);
        }
      }

      const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user });
    } catch (e) {
      res.status(500).json({ error: "Auth failed" });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Missing token" });

    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      try {
          let user;
          if (!isMongoConnected) {
             user = (inMemoryDB['users'] || []).find(u => u.uid === decoded.uid);
          } else {
             user = await mongoose.connection.db.collection('users').findOne({ uid: decoded.uid });
          }
          if (!user) return res.status(404).json({ error: "User not found" });
          res.json({ user });
      } catch (e) {
          res.status(500).json({ error: "Server error" });
      }
    });
  });

  // --- JWT MIDDLEWARE ---
  const authenticateToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      (req as any).user = user;
      next();
    });
  };

  // Protect all API routes under /api/collections
  app.use('/api/collections', authenticateToken);

  app.get('/api/collections/:name', async (req, res) => {
    try {
      if (!isMongoConnected) {
         return res.json(inMemoryDB[req.params.name] || []);
      }
      const docs = await mongoose.connection.db.collection(req.params.name).find().toArray();
      res.json(docs);
    } catch (e) {
      res.status(500).json({ error: 'Failed to fetch collection' });
    }
  });

  app.post('/api/collections/:name', async (req, res) => {
    try {
      if (!isMongoConnected) {
         if (!inMemoryDB[req.params.name]) inMemoryDB[req.params.name] = [];
         const doc = { ...req.body };
         if (!doc.id) doc.id = Date.now().toString() + Math.random().toString();
         inMemoryDB[req.params.name].push(doc);
         return res.json(doc);
      }
      const doc = { ...req.body };
      if (!doc.id) doc.id = new mongoose.Types.ObjectId().toString(); // Ensure string ID
      await mongoose.connection.db.collection(req.params.name).insertOne(doc);
      res.json(doc);
    } catch (e) {
      res.status(500).json({ error: 'Failed to insert document' });
    }
  });

  app.put('/api/collections/:name/:id', async (req, res) => {
    try {
      if (!isMongoConnected) {
          if (!inMemoryDB[req.params.name]) inMemoryDB[req.params.name] = [];
          const idx = inMemoryDB[req.params.name].findIndex(d => d.id === req.params.id);
          const updateData = { ...req.body };
          if (idx >= 0) {
             inMemoryDB[req.params.name][idx] = { ...inMemoryDB[req.params.name][idx], ...updateData };
          } else {
             inMemoryDB[req.params.name].push({ id: req.params.id, ...updateData });
          }
          return res.json({ id: req.params.id, ...updateData });
      }
      const updateData = { ...req.body };
      delete updateData._id; // Prevent updating immutable _id if it sneaks in
      
      await mongoose.connection.db.collection(req.params.name).updateOne(
        { id: req.params.id }, 
        { $set: updateData },
        { upsert: true }
      );
      res.json({ id: req.params.id, ...updateData });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update document' });
    }
  });

  app.delete('/api/collections/:name/:id', async (req, res) => {
    try {
      if (!isMongoConnected) {
          if (inMemoryDB[req.params.name]) {
              inMemoryDB[req.params.name] = inMemoryDB[req.params.name].filter(d => d.id !== req.params.id);
          }
          return res.json({ success: true });
      }
      await mongoose.connection.db.collection(req.params.name).deleteOne({ id: req.params.id });
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete document' });
    }
  });

  // Vite integration 
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
