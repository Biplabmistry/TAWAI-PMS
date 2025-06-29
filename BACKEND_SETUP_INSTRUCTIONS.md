# 🚀 Backend Setup Instructions for Legal-Tech AI System

## Step 1: Create Backend Project

Open a new terminal and run these commands **outside** your current React project:

```bash
# Navigate to parent directory
cd ..

# Create backend project
mkdir legal-tech-backend
cd legal-tech-backend

# Initialize Node.js project
npm init -y
```

## Step 2: Install Backend Dependencies

```bash
npm install express cors helmet morgan dotenv
npm install multer sharp pdf-parse mammoth
npm install openai @supabase/supabase-js
npm install jsonwebtoken bcryptjs
npm install express-rate-limit express-validator
npm install ws socket.io

# Development dependencies
npm install -D nodemon typescript @types/node @types/express
npm install -D @types/jsonwebtoken @types/bcryptjs @types/multer
```

## Step 3: Create Environment File

Create `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# 🔑 ADD YOUR OPENAI API KEY HERE
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# OpenAI Configuration
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000

# Supabase Configuration (get from your Supabase dashboard)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-generate-a-random-one
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173
```

## Step 4: Create Basic Backend Structure

Create these files in your backend project:

### `src/app.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Legal-Tech Backend API is running' });
});

// Import routes here
// app.use('/api/auth', authRoutes);
// app.use('/api/petitions', petitionRoutes);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🔒 OpenAI API configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
});
```

### `package.json` scripts
Add these scripts to your backend package.json:

```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Step 5: Test Backend Setup

1. **Start the backend**:
```bash
npm run dev
```

2. **Test the API**:
Open browser and go to: `http://localhost:3001/api/health`

You should see: `{"status":"OK","message":"Legal-Tech Backend API is running"}`

## Step 6: Update Frontend Configuration

In your React project, update `.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 🔒 Security Notes

- ✅ OpenAI API key is now secure on backend
- ✅ Frontend only communicates with your backend
- ✅ No sensitive keys exposed to client
- ✅ Proper CORS configuration
- ✅ Rate limiting and validation ready

## Next Steps

1. Get your OpenAI API key from: https://platform.openai.com/api-keys
2. Add it to the backend `.env` file
3. Set up Supabase connection
4. Implement the petition processing endpoints
5. Test the secure AI integration

## Project Structure

```
your-projects/
├── legal-tech-police-system/     # React frontend
│   ├── src/
│   ├── package.json
│   └── .env (only frontend vars)
└── legal-tech-backend/           # Node.js backend
    ├── src/
    ├── package.json
    └── .env (OpenAI key here!)
```

The OpenAI API key goes in the **backend** `.env` file, never in the frontend!