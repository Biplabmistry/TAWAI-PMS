# Backend Setup Guide for Legal-Tech AI System

## 🏗️ Architecture Overview

```
Frontend (React) → Backend API → OpenAI API → Supabase Database
                ↓
            Authentication & Authorization
                ↓
            File Processing & Storage
                ↓
            Real-time Updates (WebSocket)
```

## 📋 Step-by-Step Backend Implementation

### 1. **Initialize Node.js Backend**

```bash
mkdir legal-tech-backend
cd legal-tech-backend
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv
npm install multer sharp pdf-parse mammoth
npm install openai @supabase/supabase-js
npm install jsonwebtoken bcryptjs
npm install ws socket.io
npm install express-rate-limit express-validator

# Development dependencies
npm install -D nodemon typescript @types/node @types/express
npm install -D @types/jsonwebtoken @types/bcryptjs @types/multer
```

### 2. **Environment Configuration (.env)**

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=4000

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain.com
```

### 3. **Project Structure**

```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── petitionController.ts
│   │   ├── evidenceController.ts
│   │   └── reportController.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   ├── upload.ts
│   │   └── rateLimiter.ts
│   ├── services/
│   │   ├── openaiService.ts
│   │   ├── supabaseService.ts
│   │   ├── fileService.ts
│   │   └── websocketService.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── petitions.ts
│   │   ├── evidence.ts
│   │   └── reports.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── app.ts
├── uploads/
├── .env
├── package.json
└── tsconfig.json
```

### 4. **Core Backend Files**

#### **src/services/openaiService.ts**
```typescript
import OpenAI from 'openai';
import { ExtractedClaim, PetitionAnalysis, EvidenceEvaluation } from '../types';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async extractClaimsFromPetition(petitionText: string): Promise<PetitionAnalysis> {
    const systemPrompt = `You are a legal AI assistant for Andhra Pradesh Police...`;
    
    const response = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: petitionText }
      ],
      temperature: 0.3,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000')
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  async evaluateEvidence(evidenceDescription: string, claimId: string): Promise<EvidenceEvaluation> {
    // Implementation similar to frontend but server-side
  }
}

export const openaiService = new OpenAIService();
```

#### **src/middleware/auth.ts**
```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

#### **src/controllers/petitionController.ts**
```typescript
import { Request, Response } from 'express';
import { openaiService } from '../services/openaiService';
import { supabaseService } from '../services/supabaseService';
import { fileService } from '../services/fileService';

export const uploadPetition = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract text from file
    const petitionText = await fileService.extractTextFromFile(req.file);
    
    // Store in database
    const petition = await supabaseService.createPetition({
      content: petitionText,
      fileName: req.file.originalname,
      uploadedBy: req.user.id
    });

    res.json({ petitionId: petition.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload petition' });
  }
};

export const analyzePetition = async (req: Request, res: Response) => {
  try {
    const { petitionId } = req.params;
    
    // Get petition from database
    const petition = await supabaseService.getPetition(petitionId);
    
    // Analyze with OpenAI
    const analysis = await openaiService.extractClaimsFromPetition(petition.content);
    
    // Store analysis results
    await supabaseService.updatePetitionAnalysis(petitionId, analysis);
    
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Failed to analyze petition' });
  }
};
```

### 5. **Security Implementation**

#### **Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP'
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit file uploads
  message: 'Too many file uploads'
});
```

#### **Input Validation**
```typescript
import { body, validationResult } from 'express-validator';

export const validatePetitionUpload = [
  body('description').optional().isLength({ max: 500 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### 6. **Real-time Updates with WebSocket**

```typescript
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

export class WebSocketService {
  private io: Server;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(','),
        credentials: true
      }
    });

    this.setupAuthentication();
    this.setupEventHandlers();
  }

  private setupAuthentication() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (err) return next(new Error('Authentication error'));
        socket.data.user = user;
        next();
      });
    });
  }

  notifyPetitionUpdate(petitionId: string, update: any) {
    this.io.to(`petition-${petitionId}`).emit('petitionUpdate', update);
  }
}
```

## 🚀 Deployment Steps

### 1. **Environment Setup**
```bash
# Production server setup
sudo apt update
sudo apt install nodejs npm nginx certbot

# Install PM2 for process management
npm install -g pm2
```

### 2. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. **SSL Certificate**
```bash
sudo certbot --nginx -d your-api-domain.com
```

### 4. **Process Management**
```bash
# Start application with PM2
pm2 start dist/app.js --name "legal-tech-api"
pm2 startup
pm2 save
```

## 🔒 Security Checklist

- ✅ **API Key Security**: OpenAI key stored in environment variables
- ✅ **Authentication**: JWT-based auth with secure tokens
- ✅ **Rate Limiting**: Prevent API abuse
- ✅ **Input Validation**: Sanitize all inputs
- ✅ **File Upload Security**: Type and size validation
- ✅ **CORS Configuration**: Restrict origins
- ✅ **HTTPS**: SSL/TLS encryption
- ✅ **Database Security**: RLS policies in Supabase
- ✅ **Logging**: Comprehensive audit trails
- ✅ **Error Handling**: No sensitive data in responses

## 📊 Monitoring & Logging

```typescript
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

This architecture ensures:
- **Security**: All sensitive operations on backend
- **Scalability**: Proper separation of concerns
- **Real-time**: WebSocket for live updates
- **Compliance**: Audit trails and logging
- **Performance**: Optimized file processing