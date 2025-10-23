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

Create a .env file in your project root and add your generated secret:

   `AUTH_SECRET=your-generated-secret-key-here`

Install Dependencies

   `npm install`

Run the Development Server

   `npm run dev`


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing Credentials

For testing purposes, use these pre-configured accounts:

### Admin Account
- **Email:** `admin@test.com`
- **Password:** `admin-pass`
- **Access:** Full admin dashboard and user management features

### Volunteer Account
- **Email:** `volunteer@test.com`
- **Password:** `vol-pass`
- **Access:** Volunteer dashboard and profile management features

## Testing

Run the test suite:
```bash
npm test                # Run all tests
npm run test:coverage   # Run tests with coverage report
```

## Sources used for this project:

For authentication/registration setup: https://nextjs.org/learn/dashboard-app/adding-authentication

