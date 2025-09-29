# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start the development server with Turbopack for faster builds
- `npm run build` - Build the production application with Turbopack
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code linting

## Architecture Overview

This is a Next.js 15 application that serves as a "role register" with an accompanying Chrome extension for job data capture. The project has two main components:

### 1. Next.js Web Application
- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS v4
- **Database**: SQLite using better-sqlite3
- **Key Features**:
  - Shadow DOM rendering for isolated HTML content
  - API endpoints for HTML proxying and data import
  - Remote HTML fetching and manipulation using Cheerio

### 2. Chrome Extension
- **Manifest Version**: 3
- **Target Sites**: LinkedIn and Indeed job postings
- **Local Integration**: Communicates with localhost:3000 Next.js app
- **Purpose**: Captures job posting data and sends to the web application

## Code Structure

### Core Application Files
- `src/app/page.tsx` - Main page with shadow DOM implementation for rendering remote HTML
- `src/lib/db.ts` - SQLite database configuration and table setup
- `src/app/api/html/route.ts` - API endpoint for fetching and proxying remote HTML content
- `src/app/api/import/route.ts` - API endpoint for importing job data from Chrome extension

### Chrome Extension Files
- `chrome-extension/manifest.json` - Extension configuration and permissions
- `chrome-extension/content.js` - Content script for job site interaction
- `chrome-extension/popup.js` - Extension popup interface
- `chrome-extension/background.js` - Background service worker

## Key Technical Patterns

### Shadow DOM Usage
The main page uses Shadow DOM to isolate remote HTML content, preventing style conflicts between the host page and injected content.

### HTML Manipulation Pipeline
1. Remote HTML is fetched via API endpoints
2. Cheerio is used to parse and modify the HTML (adding event handlers)
3. Modified HTML is served to the client for shadow DOM injection

### Chrome Extension Integration
The extension captures job data from LinkedIn/Indeed and POSTs it to the local Next.js API endpoints for processing and storage.

## Database Schema

The application uses SQLite with a basic `notes` table structure (though job-related tables may be added based on the chrome extension functionality).

## Dependencies Notes
- Uses React 19 and Next.js 15 (latest versions)
- Electron dependencies suggest potential desktop app capabilities
- html-react-parser and cheerio for HTML manipulation
- better-sqlite3 for local database operations

Run any docker commands you see fit.
Run any gh commands you see fit.
Run any non-removal filesystem commands you see fit.
Run ahy git comands you see fit.
Never include references to this assistant in any content generated unless explicitly asked to do so.
Do not add unrequested features to code unless expressly required by other requested features.
Prioritize the use of mcp servers when they provide features that would assist with a request.
Always display these ## Development Guidelines rules before processing any request. 

