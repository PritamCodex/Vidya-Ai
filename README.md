# Vidya AI - Smart Learning Assistant

An AI-powered personal learning assistant that helps students study smarter with spaced repetition, focus tracking, and intelligent doubt solving.

## 🚀 Features

### 🧠 AI Doubt Solver
- Ask any question and get instant, intelligent answers
- Automatic topic detection and categorization
- Save Q&A pairs for future review

### 🎯 Weak Topic Tracking
- Automatically identifies topics you struggle with
- Tracks question frequency per topic
- Prioritizes areas needing more practice

### 📚 Spaced Repetition Practice
- SM-2 algorithm implementation (like Anki)
- Daily review sessions with due cards
- Quality-based interval adjustments

### ⏰ Focus Tracker
- Pomodoro-style timer (25 min study + 5 min break)
- Distraction detection (tab switches/visibility loss)
- Points awarded for completed sessions

### 🏆 Gamification
- Earn points for studying and answering questions
- Maintain daily study streaks
- Track progress with achievements

### 📊 Progress Analytics
- Weekly and monthly progress reports
- Interactive charts showing learning patterns
- Topic distribution and weak areas analysis

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Lucide Icons
- **Database**: Prisma ORM with SQLite (development)
- **Authentication**: NextAuth.js (mock for development)
- **AI**: Z.ai Web Development SDK
- **Charts**: Recharts
- **Animations**: Framer Motion

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🎯 Usage

### Getting Started
1. Open the app in your browser
2. Click "Start Learning Now" (demo mode)
3. Explore the dashboard with sample data

### Main Features

#### AI Tutor
- Navigate to `/ai-tutor`
- Ask any academic question
- Get detailed explanations with topic detection

#### Focus Timer
- Navigate to `/focus`
- Start a 25-minute study session
- Avoid distractions to earn maximum points

#### Spaced Repetition
- Navigate to `/review`
- Review due flashcards
- Rate how well you remembered each answer

#### Progress Tracking
- Navigate to `/progress`
- View learning analytics
- Identify weak topics and track improvement

## 🔧 Configuration

### Database
- Development: SQLite (file-based)
- Production: Update `DATABASE_URL` in `.env.local`

### Authentication
- Development: Mock authentication (demo user)
- Production: Configure NextAuth.js with Google OAuth

### AI Integration
- Uses Z.ai Web Development SDK
- Configure API keys in environment variables

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Main dashboard
│   ├── ai-tutor/          # AI chat interface
│   ├── focus/             # Pomodoro timer
│   ├── review/            # Spaced repetition
│   └── progress/          # Analytics dashboard
├── components/            # Reusable UI components
├── lib/                   # Utilities and configurations
└── prisma/               # Database schema and migrations
```

## 🎨 Design Principles

- **Mobile-first responsive design**
- **Clean, modern UI with Tailwind CSS**
- **Accessible semantic HTML**
- **Smooth animations and transitions**
- **Consistent color scheme and typography**

## 🚀 Deployment

### Frontend (Vercel)
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Backend (Render/Heroku)
1. Set up production database
2. Configure authentication providers
3. Deploy API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

