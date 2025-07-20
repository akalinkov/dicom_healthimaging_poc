# Frontend

React frontend for DICOM HealthImaging POC, built with Vite and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`

## Environment

```bash
cp .env.example .env
```

Update `VITE_API_BASE_URL` if backend runs on different port.

## Structure

```
src/
├── components/
│   ├── SearchForm.jsx     # Search form with patient name and modality
│   └── ResultsTable.jsx   # Results table with view/download actions
├── services/
│   ├── api.js            # API client
│   └── logger.js         # Logging service
├── App.jsx               # Main component
├── main.jsx              # Entry point
└── index.css             # Tailwind CSS with medical theme
```

## Features

- Responsive design with medical UI theme
- DICOM study search by patient name and modality
- Loading states and error handling
- Toast notifications for user feedback

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview build
