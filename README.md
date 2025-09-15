# Gemini Backend Clone

A Fully Functional Gemini Backend Clone project, assignment for Kuvaka Tech.

## 💡 Objective
Develop a Gemini-style backend system that enables user-specific chatrooms, OTP-based
login, Gemini API-powered AI conversations, and subscription handling via Stripe.

### 💻 Tech Stack
- Node.js - For Main Backend Runtime needed to run JavaScript.
- Express.js - REST API framework for handling HTTP Requests.
- PostgreSQL - Powerful Relational Database Management System for data storage.
- Stripe - Payments platform integrated via stripe sandbox.

### 📦 Installation
 To run it locally follow the given instructions below:

**PRE-REQUISITES :** Node.js, PostgreSQL and stripe CLI installed in system.
**OPTIONAL :** Redis installed on system for local in memory storage storage.

1. Clone the repository
```shell
git clone https://github.com/nexus949/Gemini-Backend-Clone.git
```

2. Navigate into the repo
```shell
cd Gemini-Backend-Clone
```

3. Install the dependecies
```shell
npm install
```

4. Install nodemon globally
```shell
npm i -g nodemon
```

5. Create a `.env` file and add your own environment variables, here is the template for all required variables:
```shell
DB_NAME=
DB_USER=
DB_PASS=
DB_PORT=5432
DB_HOST=
SERVER_PORT=3000
JWT_SECRET_KEY=
STRIPE_SECRET_KEY=
PRO_PRICE_ID=
STRIPE_WEBHOOK_SIGNING_SECRET=
GEMINI_API_KEY=
UPSTASH_URL=
UPSTASH_URL_HTTP=
UPSTASH_URL_TOKEN=
```

6. Forward stripe webhook to localhost, open terminal and navigate to where the stripe CLI is and run this command. This will give the `STRIPE_WEBHOOK_SIGNING_SECRET`
```shell
stripe listen --forward-to localhost:3000/v1/webhook/stripe
```

7. Run the server
```shell
npm run dev
```

Server Runs on PORT 3000 by default ! Postman can be used to hit endpoints.

---

### 🚀 Design Idea and Choices

- The application has 3 main parts - Authentication via OTP, Gemini Chatrooms and Payments via Stripe.
- Stripe Sandbox is used as needed by The assignment to initiate mock payments with mock details.
- The Database consists of 3 tables - users, - chatrooms_metadata, -chatrooms_messages.
- The `users` table store data about the user like phone number and name and password.
- The `chatrooms_metadata` stores data about each chatroom and has a FK to `users` table.
- The `chatrooms_messages` table stores all the messages from user and assistant and has a FK to metadata table.
- Passwords are hashed using [argon2](https://www.npmjs.com/package/argon2) before storing in database which makes it more secure.
- Message ids are extracted from Gemini responses and are suffixed with `_A` for assistant and `_U` for user and stored in the database.
- Caching is used while retrieveing all the chatrooms created by a user and are cached to reduce DB load.
- User's data are also cached while verifying OTP during login so that  it can be used to actively rate limit on each AI prompt.
- Basic users are limited to only 5 prompts per day while Pro users have unlimited prompts per day. This is done via *rate limiting*.
- Cloud based PostgreSQL has been used  alongside cloud based Redis server.
- As required by the assignment, A message queue has been implemented to handle Gemini request asynchronously.
- JWT is always sent as bearer token and expires within 20 minutes of creation.

### 🔨 Key Services Used

- [BullMQ](https://bullmq.io/) - Message Queue.
- [Upstash](https://upstash.com/) - Redis Cloud Server.
- [Render PostgreSQL](https://render.com/docs/postgresql) - Cloud Based PostgreSQL for data storage.
- [Stripe](https://stripe.com/in) - For Payment Integration (Sandbox mode).
- [JWT](https://www.npmjs.com/package/jsonwebtoken) - For Secure Authentication.
- [Google Gemini](https://ai.google.dev/) - The AI integrate in this project.
- [Node Cache](https://www.npmjs.com/package/node-cache) - Used as caching library for efficient caching.
- [Stripe CLI](https://github.com/stripe/stripe-cli) - Needed to forward webhooks to localhost.

### 🧪 How to Test Via Postman

Below are all the valid endpoints and can be easily hit using the correct HTTP method. Bootup postman type the correct URL and HTTP method and press SEND.

| Endpoint                     | Method | Auth Required      | Description                                                                 |
| ---------------------------- | ------ | ------------------ | --------------------------------------------------------------------------- |
| /v1/auth/signup              | POST   | ❌                  | Registers a new user with mobile number<br><br>and optional info.           |
| /v1/auth/send-otp            | POST   | ❌                  | Sends an OTP to the user’s mobile<br>number (mocked, returned in response). |
| /v1/auth/verify-otp          | POST   | ❌                  | Verifies the OTP and returns a JWT token<br><br>for the session.            |
| /v1/auth/forgot-password     | POST   | ❌                  | Sends OTP for password reset.                                               |
| /v1/auth/change-password     | POST   | ✅                  | Allows the user to change password while<br>logged in.                      |
| /v1/user/me                  | GET    | ✅                  | Returns details about the currently authenticated user.                     |
| /v1/chatroom                 | POST   | ✅                  | Creates a new chatroom for the<br><br>authenticated user.                   |
| /v1/chatroom                 | GET    | ✅                  | Lists all chatrooms for the user.                                           |
| /v1/chatroom/:id             | GET    | ✅                  | Retrieves detailed information about a specific chatroom.                   |
| /v1/chatroom/:id/me<br>ssage | POST   | ✅                  | Sends a message and receives a Gemini<br>response (via queue/async call).   |
| /v1/chatroom/:id/message     | GET    | ✅                  | Get the Last Message from interacting with Gemini.                          |
| /v1/chatroom/:id/message/all | GET    | ✅                  | Display all Messages for a specific chatroom                                |
| /v1/subscribe/pro            | POST   | ✅                  | Initiates a Pro subscription                                                |
| /v1/webhook/stripe           | POST   | ❌ (Stripe<br>only) | Handles Stripe webhook events (e.g.,<br>payment success/failure).           |
| /v1/subscription/status      | GET    | ✅                  | Checks the user's current subscription tier<br>(Basic or Pro).              |

---

### 💸 Stripe integration screenshot

[![Stripe-Integration.png](https://i.postimg.cc/Y2v6rFRF/Stripe-Integration.png)](https://postimg.cc/F1QdG72F)

---

### 👨🏼‍💻 Gemini API Integration Overview

Gemini is integrated in this project using the [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) library for Node.js.

The Gemini model used for this Project is : **Gemini 2.5 Flash Lite**

This model is chose primarily for speed and efficiency, since its a smaller model compared to other models this keep the responses concise and lightweight. Moreover as a part of pre instruction is always sent via the API:

```js
{
	role: 'model',
	 parts: [
	      { text: "Keep the response short" }
	]
}
```

This ensures that the response received is concise and Direct.


### 🛴 Queue Logic

Pretty rough on this one, I didn't knew what a queue is 3 days ago but managed to use it in my assignment as required.

I have used BullMQ which runs on redis. For the redis server I used Upstash.

The basic flow is user send a prompt -> The prompt is received and a pushed to the message queue. A message queue is basically storing a process in memory for async execution so that it does not block the execution of the main program.

Once the task is successfully added to the queue the user is returned with a prompt of the task being accepted. A Worker process runs in the background that then handles the tasks in the active queue. Once finished the worker stores both the prompt and response received from Gemini in Database. The user can then hit `/v1/chatroom/:id/message` endpoint to get the response or just hit `/v1/chatroom/:id/message/all` to get all the messages.


### 🌎 Deployment

Sadly I was not able to deploy it due to money concerns. I primarily tried to host it on [Render](https://render.com/) but the project consists of a background process, The Worker for handling Queued Tasks and sadly deploying a worker process on Render is not free so I decided not to deploy.

---
