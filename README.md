## Set Up


This project uses NextAuth.js (beta version) for authentication, which requires a secret key to encrypt cookies and secure user sessions.

### Prerequisites

Next.js 14+
Node.js installed

### Setup Instructions

Generate an Authentication Secret

macOS/Linux:

  ` openssl rand -base64 32 `

Windows:

Use the online generator: https://generate-secret.vercel.app/32

#### Configure Environment Variables

Create a .env.local file in your project root and add your generated secret:

   `AUTH_SECRET=your-generated-secret-key-here`

Install Dependencies

   `npm install`

Run the Development Server

   `npm run dev`


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Sources used for this project:

For authentication/registration setup: https://nextjs.org/learn/dashboard-app/adding-authentication

