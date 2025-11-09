Website : https://devforum-frontend.onrender.com/ <br>
Repo for project description - 
https://akshatpy.github.io/DevForum/

# DevForum - MERN Q&A Platform

DevForum is a full-stack, community-driven Q&A platform for developers, inspired by the features of Stack Overflow and the community-based structure of Reddit. Users can ask questions, post answers, vote on content, and engage in specific topic-based communities.



## Key Features

* **Full MERN Stack:** Built from the ground up with MongoDB, Express.js, React, and Node.js.
* **Authentication:** Secure user registration and login using JSON Web Tokens (JWT) and `bcryptjs` for password hashing.
* **Community-Based (Subreddit Style):** Users can create, join, and post questions within specific communities (e.g., `r/javascript`, `r/python`).
* **Q&A Functionality:**
    * Users can **post questions** with a title, body, and tags.
    * Users can **post answers** to any question.
    * Question authors can **accept one answer** as the correct one.
* **Voting & Reputation:**
    * Users can **upvote** or **downvote** both questions and answers.
    * A **reputation system** automatically grants points to users for upvotes and accepted answers.
* **User Profiles:**
    * Each user has a public profile displaying their bio, reputation, and a history of their questions and answers.
    * Users can edit their own profile (bio and avatar).
* **Dynamic Feed:**
    * The home page features a main feed of all questions.
    * Users can **sort** the feed by "New," "Top" (by votes), or "Hot" (by answer count).
    * Users can **filter** the feed by clicking on a community/tag.
* **State Management:** Uses **Redux Toolkit** for efficient and centralized front-end state management.
* **UI/UX:** Clean, responsive, and modern interface built with **Material-UI (MUI)**.
* **Deployment:** Configured for seamless monorepo deployment on **Vercel**.

## Tech Stack

### Backend
* **Node.js:** Runtime environment
* **Express.js:** Server framework
* **MongoDB:** NoSQL database
* **Mongoose:** Object Data Modeling (ODM) for MongoDB
* **JSON Web Token (JWT):** For secure authentication
* **bcryptjs:** For password hashing
* **`express-validator`:** For API input validation

### Frontend
* **React.js:** UI library
* **Redux Toolkit:** State management
* **React Router:** Client-side routing
* **Material-UI (MUI):** React component library
* **Axios:** HTTP client for API requests

### Deployment
* **Vercel:** Configured for monorepo deployment (`vercel.json` included)
