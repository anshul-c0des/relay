# 🚀 Relay - Real-time Messaging App

Relay is a fast, real-time one-on-one messaging application. Built with modern web technologies, this app provides a seamless chat experience with features like real-time updates, typing indicators, message reactions, and more.

## 🌐 [Live Demo](https://relay-dusky.vercel.app)

## 📋 Features
- Authentication: Secure sign-up and login via Clerk.
- Real-time Messaging: Instant message sending and receiving.
- User List & Search: Browse and search users by name or email.
- Private Conversations: Start and manage one-on-one chats.
- Typing Indicators: See when a user is typing.
- Online Presence: Live updates of user online/offline status (heartbeat).
- Message Timestamps: Display messages with context-aware timestamps (today, same year, different year).
- Unread Message Count: Sidebar displays unread message counts for each conversation.
- Smart Auto-scroll: Auto-scroll to new messages, with a “New messages” button when scrolled up.
- Message Deletion (Soft Delete): Option to delete your own messages with a placeholder.
- Message Reactions: React to messages with emojis and view reaction counts.

## 🛠️ Tech Stack
- Frontend:
    - Next.js (App Router)
    - TypeScript
    - Tailwind CSS (Mobile-first design)
    - shadcn/ui (UI components)

-Backend:
    - Convex (Database + Backend + Real-time)
    - Clerk (Authentication)

## ⚙️ Setup

1. Clone the Repo:
```bash
git clone https://github.com/anshul-c0des/relay
cd relay
```
2. Install Dependencies:
```bash
npm install
```

3. Configure Environment Variables:
Create a .env.local file in the root of the project and add the following variables:
```bash
CONVEX_DEPLOYMENT=<Your Convex Deployment>
NEXT_PUBLIC_CONVEX_URL=<Your Convex URL>
NEXT_PUBLIC_CONVEX_SITE_URL=<Your Convex Site URL>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<Your Clerk Publishable Key>
CLERK_SECRET_KEY=<Your Clerk Secret Key>
```
4. Run Locally:
```bash
npm run dev
```
Visit http://localhost:3000
 to view the app in action.

## 🗂️ Project Structure
- **/app** - Contains the app's pages and routing logic.
- **/components** - UI components like message bubbles, conversation list, and search bar.
- **/convex** - Backend logic, database schema, and real-time subscriptions using Convex.
- **/lib** - Utilities for tasks like timestamp formatting, auto-scroll management, etc.
