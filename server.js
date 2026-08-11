const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from workspace root
app.use(express.static(__dirname, {
  // Don't set cache headers here — we'll handle them manually
  etag: true,
  lastModified: true,
}));

// Apply custom cache headers matching _headers file
app.use((req, res, next) => {
  const noCache = ['/index.html', '/sw.js', '/manifest.json', '/supabase-api.js', '/'];
  const p = req.path;

  if (noCache.includes(p) || p === '/') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  } else if (p.startsWith('/assets/')) {
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('X-Content-Type-Options', 'nosniff');
  next();
});

// SPA fallback — all routes serve index.html (mirrors _redirects: /* /index.html 200)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Star Follower running on port ${PORT}`);
});
