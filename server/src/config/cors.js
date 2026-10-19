import { env } from './env.js';

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Permissive matching for dev, configured CLIENT_URL, Netlify, Render, and Vercel
    if (
      origin === env.CLIENT_URL ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.netlify.app') ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.onrender.com') ||
      env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    // Default allow for demo convenience
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
