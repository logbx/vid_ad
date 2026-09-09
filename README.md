# Vid_Ad - AI-Powered Video Ad Generator

An AI-first video advertising platform that generates professional, dynamic video advertisements from simple text descriptions using cutting-edge AI models.

## Overview

Vid_Ad is a Next.js application that enables users to create professional video advertisements without video editing skills or stock footage. The platform leverages OpenAI's GPT models for scene generation, Replicate's Seedance and Kling models for video synthesis, and a sophisticated pipeline for audio, transitions, and effects.

### Key Features

- **AI Scene Generation** - GPT-powered storyboarding and scene creation
- **Multi-Model Video Synthesis** - Support for Seedance (Lite/Pro) and Kling v2.5 Turbo Pro
- **Logo Generation** - AI-powered brand logo creation with multiple variations
- **Multiple Workflows**:
  - Image-to-Video: Generate concept images, select best, create video
  - Text-to-Video: Generate concepts with storyboards
  - YOLO Mode: Auto-generate video directly from input
- **Brand Customization** - Tone, colors, keywords, and logo consistency
- **Campaign Management** - Track and organize multiple video campaigns
- **Firebase Integration** - Authentication, storage, and cloud functions

## Tech Stack

### Frontend
- **Next.js 16.0.1** with React 19.2.0
- **TypeScript 5.9.3** for type safety
- **Tailwind CSS 4.1.16** for styling
- **React Hook Form** with Zod validation

### Backend & Infrastructure
- **Firebase**:
  - Authentication (email/password + AWS Cognito integration)
  - Firestore (NoSQL database)
  - Cloud Functions (Node.js 20)
  - Storage (media files)
- **AWS**:
  - S3 (video/image storage)
  - Additional services (EC2, ECS, CloudWatch, etc.)

### AI/ML Services
- **OpenAI** - GPT models for ad copy and scene generation
- **Replicate** - Seedance & Kling models for video generation
- **LangChain** - AI orchestration framework

### Media Processing
- **FFmpeg** - Video processing and assembly
- **Sharp** - Image optimization

## Prerequisites

- **Node.js** 20.x or higher (v22.14.0 tested)
- **npm** 10.x or higher
- **Firebase Account** (for authentication and storage)
- **AWS Account** (for S3 storage)
- **API Keys**:
  - OpenAI API key
  - Replicate API token
  - Firebase credentials
  - AWS credentials

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vid_ad
```

2. **Install dependencies**
```bash
# Root dependencies
npm install

# Firebase Functions dependencies
cd functions
npm install
cd ..
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
# OpenAI (Required for AI scene generation)
OPENAI_API_KEY=your_openai_api_key_here

# Replicate (Required for video generation)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side only)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name

# Optional
NODE_ENV=development
```

See `.env.example` for a complete template.

4. **Configure Firebase**

- Create a Firebase project at https://console.firebase.google.com
- Enable Authentication (Email/Password)
- Create a Firestore database
- Set up Firebase Storage
- Download your service account key and add to environment variables

5. **Configure AWS S3**

- Create an S3 bucket for media storage
- Create an IAM user with S3 access permissions
- Add credentials to environment variables

## Development

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

### Firebase Emulators (Optional)

For local development without connecting to Firebase:

```bash
npm run emulators        # Start Firebase emulators
npm run emulators:export # Export emulator data
npm run emulators:import # Import emulator data
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `.next` directory.

## Project Structure

```
vid_ad/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── generate/          # Ad generation flow
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── form/             # Form components
│   └── voiceover/        # Voiceover components
├── lib/                   # Shared libraries
│   ├── firebase/         # Firebase configuration
│   ├── schemas/          # Zod validation schemas
│   └── services/         # Business logic services
├── functions/            # Firebase Cloud Functions
├── public/               # Static assets
└── docs/                 # Documentation
```

## Features & Usage

### 1. Generate a Video Ad Campaign

1. Navigate to `/generate`
2. Fill in product details:
   - Product name and description
   - Keywords and target audience
   - Brand tone and primary color
3. Configure video settings:
   - Number of variations (1-3)
   - Duration (5-10 seconds)
   - Resolution and frame rate
   - Video model (Seedance Lite/Pro or Kling)
4. Choose workflow:
   - Image-to-Video (recommended)
   - Text-to-Video
   - YOLO Mode (fastest)
5. Generate and review results

### 2. Logo Generation

- AI-powered logo generation with 3 variations
- Select and refine logos within the generation flow
- Consistent logo integration across all scenes

### 3. Campaign Management

- View all campaigns in `/dashboard/campaigns`
- Track generation status
- Download completed videos
- Regenerate or modify campaigns

## Known Issues & Status

### Current Status

✅ **Working**:
- TypeScript compilation and build process
- Firebase authentication flow
- AI scene generation with OpenAI
- Video generation with Replicate
- Logo generation with multiple variations
- Campaign storage and retrieval
- Image-to-video workflow

⚠️ **Known Issues**:
1. **Campaign Data Persistence**: Generating a new campaign overwrites previous campaign data in localStorage. This is a documented architectural limitation - see `QUICK_SUMMARY.md` for details.
2. **Middleware Deprecation**: Next.js middleware is deprecated. Will need migration to proxy configuration in a future update.
3. **Dependency Vulnerabilities**: 11 moderate vulnerabilities in transitive dependencies (primarily in Firebase and Google Cloud libraries). These are in upstream packages and will be resolved when vendors update their dependencies.

### Security Considerations

The remaining npm audit vulnerabilities are:
- **Moderate severity**: 11 issues in Firebase Admin SDK and Google Cloud dependencies
- **Impact**: Low risk for this application as they affect internal Firebase/GCP communication
- **Mitigation**: Requires upstream vendor updates (firebase-admin, @google-cloud packages)

## Testing

### Manual Testing

```bash
# Run development server
npm run dev

# Test generation flow
1. Visit http://localhost:3000/generate
2. Fill out the form with test data
3. Submit and verify video generation
4. Check campaign storage in dashboard
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Firebase Hosting

```bash
# Build static export
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Docker

See `Dockerfile` (if present) or create one based on standard Next.js patterns.

## Cost Estimates

### Per Video Generation (7-second video, 1080p)

- **OpenAI GPT-4**: ~$0.01 per scene generation
- **Replicate Seedance Lite**: ~$0.25 per video
- **Replicate Seedance Pro**: ~$0.42 per video
- **Kling v2.5 Turbo Pro**: Varies by usage
- **Total**: ~$0.26-$0.45 per video (excluding storage)

### Monthly Estimates (100 videos)

- AI Generation: ~$26-$45
- AWS S3 Storage: ~$1-5
- Firebase: Free tier sufficient for development
- **Total**: ~$30-$50/month for moderate usage

## Documentation

Additional documentation is available in the repository:

- `QUICK_SUMMARY.md` - Known issues and architectural decisions
- `AI-Ad-Generator-PRD-FINAL.md` - Complete product requirements
- `AUTH_SYSTEM_OVERVIEW.md` - Authentication architecture
- `docs/architecture/` - Architecture diagrams and tech stack

## Contributing

This is an archived project being modernized for portfolio purposes. Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

ISC

## Support

For questions or issues:
1. Check existing documentation in `/docs`
2. Review `QUICK_SUMMARY.md` for known issues
3. Open an issue in the repository

---

**Last Updated**: September 9, 2026  
**Build Status**: ✅ Passing  
**Production Ready**: ⚠️ With known limitations (see Known Issues)
