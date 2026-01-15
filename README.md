# Lead Gen

A modern web application to discover local business leads using the Yelp Fusion API. Enter a city and business niche to find qualified leads instantly.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-cyan)

## Features

- 🔍 Search for businesses by city and niche
- 📊 View detailed business information (name, address, phone, ratings)
- 📥 Export leads to CSV
- 🎨 Modern, responsive UI with dark mode support

## Getting Started

### Prerequisites

- Node.js 18+
- Yelp Fusion API key ([Get one here](https://www.yelp.com/developers))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/saeeed22/lead-gen.git
   cd lead-gen
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file from the example
   ```bash
   cp .env.example .env
   ```

4. Add your Yelp API key to `.env`
   ```
   YELP_API_KEY=your_yelp_api_key_here
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Framework**: Next.js 16 with Turbopack
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Data Fetching**: React Query
- **API**: Yelp Fusion API

## License

MIT
