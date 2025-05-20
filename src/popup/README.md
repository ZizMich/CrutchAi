# CrutchAI Chrome Extension

## Overview

CrutchAI is a Chrome extension that provides AI-powered assistance through a popup interface. It features user authentication via Supabase, theme customization, and preference management.

## Features

- OAuth authentication with Google, Apple, and email (magic link)
- Light/dark/system theme support
- Persistent user preferences
- Responsive UI with Tailwind CSS and DaisyUI

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS with DaisyUI
- Supabase for authentication
- Chrome Extension API

## Development

### Prerequisites

- Node.js 18+ and npm
- Chrome browser for testing

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   cp .env.example .env
   ```

### Development Commands

- Run development server:
  ```
  npm run dev
  ```
- Build the extension:
  ```
  npm run build
  ```
- Lint the codebase:
  ```
  npm run lint
  ```

### Testing in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the `dist` directory

## Project Structure

- `/src`: Source code
  - `/components`: Reusable UI components
  - `/pages`: Page-level components
  - `/context`: React context providers
  - `/assets`: Static assets
- `/public`: Static files
- `/dist`: Build output (generated)

## Contributing

Please follow the established code style and patterns when contributing. Make sure to test your changes thoroughly before submitting a pull request.

## License

MIT
