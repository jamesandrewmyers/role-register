# RoleRegister

RoleRegister is a **local-first job application tracking system** built with Next.js 15 and SQLite. It captures job postings from LinkedIn via a Chrome extension, extracts requirements using pattern-based parsing, and helps you manage your job search with event tracking and application status management.

---

## Current Features

### Job Posting Capture
- **Chrome Extension Integration**: Capture job postings directly from LinkedIn job pages
- **Automatic Data Processing**: Background worker extracts job title, company, location, and description
- **Pattern-Based Requirement Extraction**: Identifies required and nice-to-have qualifications from job descriptions
- **Local Storage**: All data stored locally in SQLite database

### Role Listing Management
- **Detailed View**: Split-pane interface with resizable divider showing job description and metadata
- **Event Tracking**: Track application timeline with custom events (Application, Interview, Offer, Not Applying)
- **Status Management**: Mark listings with application status and dates
- **Company & Location Data**: Automatic extraction and normalization of company names and locations

### Data Management
- **Admin Interface**: View and manage raw data, events, and processing queue
- **Reprocessing**: Re-run extraction on captured job postings
- **Bulk Operations**: Reprocess all captured data with confirmation dialog

### Developer Features
- **Comprehensive Test Suite**: 134 BDD-style unit tests with Vitest and React Testing Library
- **Type Safety**: Full TypeScript coverage
- **Worker Threads**: Background processing for HTML parsing and requirement extraction

---

## Tech Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Styling**: Tailwind CSS v4
- **Database**: SQLite with better-sqlite3 and Drizzle ORM
- **Testing**: Vitest, React Testing Library, jsdom
- **HTML Parsing**: Cheerio
- **Chrome Extension**: Manifest V3

---

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm package manager
- Chrome browser (for extension)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jamesandrewmyers/role-register.git
cd role-register
```

2. Install dependencies:
```bash
npm install
```

3. Build the worker:
```bash
npm run build:worker
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` directory from this project
5. Navigate to a LinkedIn job posting
6. Click the extension icon to capture the job data

---

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run test suite
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage report

### Testing

The project includes comprehensive unit tests:
- 109 component tests covering UI behavior, user interactions, and edge cases
- 25 utility tests for requirement extraction logic
- All tests follow behavior-driven development (BDD) patterns

Run tests:
```bash
npm test
```

---

## Architecture

### Data Flow

1. **Capture**: Chrome extension sends job posting HTML to `/api/import`
2. **Store**: Raw HTML stored in `data_received` table
3. **Queue**: Processing event created in `event_info` table
4. **Process**: Worker thread parses HTML, extracts data, stores in `role_listing` and `role_qualifications`
5. **Display**: UI shows processed listings with events and status tracking

### Database Schema

- `data_received`: Raw captured HTML and metadata
- `role_listing`: Processed job postings
- `role_company`: Normalized company data
- `role_location`: Normalized location data (city/state)
- `role_state`: US state reference data
- `role_qualifications`: Extracted requirements (required and nice-to-have)
- `role_listing_event`: Application timeline events
- `event_info`: Background processing queue

---

## Privacy & Data

**All data is stored locally on your machine.**

- No remote accounts required
- No data transmission to external services
- SQLite database stored in project directory
- Chrome extension only communicates with `localhost:3000`

---

## Project Status

**Pre-Alpha**: Core functionality implemented but under active development.

### Implemented
✅ Job posting capture from LinkedIn  
✅ Pattern-based requirement extraction  
✅ Event tracking and status management  
✅ Admin data management interface  
✅ Comprehensive test coverage  

### Planned
- [ ] Metrics dashboard (application stats, conversion rates)
- [ ] Support for additional job sites (Indeed, etc.)
- [ ] Custom status definitions
- [ ] Export functionality
- [ ] Search and filtering

---

## Contributing

This is a personal project in early development. Issues and pull requests are welcome.

---

## License

[Add license information]

---

## Acknowledgments

Built with Next.js, React, Tailwind CSS, and SQLite.
