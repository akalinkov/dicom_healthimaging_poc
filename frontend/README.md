# DICOM HealthImaging POC - Frontend

A modern React frontend for the DICOM HealthImaging proof-of-concept, built with Vite and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the API base URL if needed:
```
VITE_API_BASE_URL=http://localhost:3000
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── SearchForm.jsx     # DICOM search form with patient name and modality
│   └── ResultsTable.jsx   # Results table with view/download actions
├── services/
│   ├── api.js            # API client with structured logging
│   └── logger.js         # Centralized logging service
├── App.jsx               # Main application component
├── main.jsx              # Application entry point
└── index.css             # Tailwind CSS with medical theme
```

## 🎨 Features

- **Medical-grade UI**: Clean, professional interface with medical blue color scheme
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Search**: Connect to backend API for DICOM study search
- **Loading States**: Smooth loading indicators and error handling
- **Toast Notifications**: User feedback for actions (view/download)
- **Structured Logging**: Consistent logging across all components

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🎯 API Integration

The frontend connects to the backend API at `/search` endpoint. Mock data is displayed when the backend is in development mode.

**Search Parameters:**
- `patientName` - Patient name (optional)
- `modality` - Medical imaging modality (optional)
- `datastoreId` - AWS HealthImaging datastore ID (auto-filled for POC)

## 📱 Responsive Breakpoints

- Mobile: `< 768px`
- Tablet: `768px - 1024px` 
- Desktop: `> 1024px`

All components are fully responsive and optimized for different screen sizes.
