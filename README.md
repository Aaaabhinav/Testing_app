# TaskFlow: Cross-Platform Synchronized Todo App

**TaskFlow** is a modern, cross-platform task management application designed to showcase real-time data synchronization between a mobile application and a web client using a unified backend.

## 🌟 The Core Idea
The main goal of this project is to demonstrate a seamless, synchronized experience across multiple platforms. Whether a user adds a task on their Android/iOS device or marks a task as completed on their desktop browser, the state is immediately reflected everywhere. 

This is achieved through a centralized REST API backend connected to a robust PostgreSQL database, with secure cross-platform authentication handled by Firebase.

## 🏗️ Architecture & Tech Stack

This repository is built using a **monorepo-style structure** containing three distinct environments:

### 1. Mobile Application (Root Directory)
A fully-featured mobile application built with **React Native (Expo)**.
- **UI:** Custom dark-themed design with smooth Animated API transitions and glassmorphism elements.
- **Build System:** Deployed via Expo Application Services (EAS) to generate standalone Android APKs.
- **Navigation:** `@react-navigation` stack routing.

### 2. Web Application (`/web-client`)
A highly responsive, lightweight web application built with **React and Vite**.
- **UI:** Mirrors the mobile app's premium dark aesthetics using vanilla CSS and Lucide React icons.
- **State:** Features real-time filtering (All / Active / Completed).
- **Deployment:** Optimized for zero-configuration deployment on **Vercel**.

### 3. Backend Server (`/server`)
A centralized API serving both mobile and web clients, built with **Node.js & Express**.
- **Database:** **PostgreSQL** (hosted via Neon/Render) for persistent, reliable storage.
- **Security:** Validates Firebase JWT tokens via the Firebase Admin SDK middleware to ensure requests are authenticated.
- **Deployment:** Hosted on **Render.com**.

## 🔐 Authentication Flow
Authentication is unified using **Firebase Auth**. 
1. Users log in or register on either the mobile or web app using the Firebase Client SDK.
2. The client receives a JWT Token.
3. Every API request to the backend includes this token in the `Authorization: Bearer <token>` header.
4. The Node.js backend verifies the token using the Firebase Admin SDK before accessing the PostgreSQL database.

## 🚀 Getting Started Locally

### Prerequisites
- Node.js installed
- A PostgreSQL instance (local or remote)
- A Firebase Project (with Web and Admin SDK credentials)

### Setup the Backend
1. `cd server`
2. `npm install`
3. Add your `serviceAccountKey.json` from Firebase.
4. Create a `.env` file with your `DATABASE_URL` and `PORT`.
5. `npm start` (Tables will auto-initialize on the first run).

### Setup the Web Client
1. `cd web-client`
2. `npm install`
3. Update `src/database.js` to point to your local or remote backend URL.
4. `npm run dev`

### Setup the Mobile App
1. From the root directory, run `npm install`.
2. Update `src/config/database.js` to point to your backend.
3. `npx expo start` to run in an emulator, or `npx expo start --web` to run the Expo web fallback.

## 💡 Key Learnings
- Managing complex state synchronization between distinct frontend environments.
- Securing REST APIs using Firebase Admin token verification.
- Implementing platform-agnostic UI/UX patterns that feel native on both web and mobile.
- Deploying a multi-faceted stack across Render (Backend), Vercel (Web), and EAS (Mobile).
