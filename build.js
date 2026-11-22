// build.js: Generates firebase-config.js from environment variables in CI/CD (e.g., Vercel)
const fs = require("fs");
const path = require("path");

const config = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "personal-expense-tracker-b4de6.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "personal-expense-tracker-b4de6",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "personal-expense-tracker-b4de6.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "601236632384",
  appId: process.env.FIREBASE_APP_ID || "1:601236632384:web:3f32e566cca2fc7db5c0a5"
};

const content = `// Auto-generated during build
export const firebaseConfig = ${JSON.stringify(config, null, 2)};

export function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
}
`;

fs.writeFileSync(path.join(__dirname, "firebase-config.js"), content, "utf8");
console.log("firebase-config.js successfully generated from environment variables.");
