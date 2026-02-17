# 🛡️ TaskQuest: The Productivity RPG

TaskQuest is a premium, gamified task management system designed to turn your daily to-do list into an epic quest. Build your streak, earn XP, and level up your productivity in a beautiful, high-performance interface.

<img width="806" height="953" alt="image" src="https://github.com/user-attachments/assets/126f81c1-48d0-4638-9913-9210e25c6488" />


## ✨ Features

- **🏹 Quest Management**: Categorize tasks by difficulty (Easy, Medium, Hard) and earn XP.
- **📈 Hero Statistics**: Track your total XP, daily streaks, and success rates.
- **📅 Interactive Contribution Map**: Visualize your productivity over the year.
- **📓 Notes**: Secure your "wisdom" with a built-in notes system.
- **⚡ Dynamic Level System**: Level up with a celebratory popup as you cross XP thresholds.
- **🎭 Coach Personalities**: Choose between Friendly, Neutral, or "Rude" AI coach feedback.
- **🌙 Premium Dark Mode**: A stunning, high-contrast dark theme for late-night grinding.

## 🚀 Tech Stack

- **Frontend**: React (Vite), Tailwind CSS 4, Framer Motion
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas
- **Hosting**: Render

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MithunChowdary/taskquest.git
   cd taskquest
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file with MONGODB_URI and JWT_SECRET
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with VITE_API_BASE
   npm run dev
   ```

## 🌍 Deployment Notes

TaskQuest is designed for seamless deployment on **Render**:
- **Backend**: Deployed as a Web Service. Ensure environment variables are set in the Render dashboard.
- **Frontend**: Deployed as a Static Site. Note that `VITE_API_BASE` is injected at build time.

## 📝 License

This project is for personal productivity tracking. "Stay legendary!"
