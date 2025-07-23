# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DICOM HealthImaging POC demonstrating React frontend integration with AWS HealthImaging service for medical imaging workflows. The project consists of three main components:

- **React Frontend**: Medical imaging viewer with search interface using Cornerstone.js and DWV
- **Express.js Backend**: RESTful API with AWS HealthImaging SDK integration and configurable mock/AWS modes
- **Terraform Infrastructure**: AWS HealthImaging datastore provisioning

## Architecture

### Frontend (`frontend/`)
- React 19 with Vite build system
- Medical imaging libraries: @cornerstonejs/core, dwv, dicom-parser
- Tailwind CSS for styling
- Components: SearchForm, ResultsTable, DicomViewer

### Backend (`server/`)
- Express.js API server with helmet, cors, morgan middleware
- Configurable profiles (mock/aws) loaded via `--profile=` argument
- Routes: `/search`, `/view/:id`, `/download/:id/frame/:frameId`, `/health`
- AWS SDK integration for HealthImaging service

### Configuration System
- Profile-based configuration in `server/config/`: loads `.env.mock` or `.env.aws` files
- Mock mode for development, AWS mode for production
- Configuration validation for AWS profile

## Common Development Commands

### Project Setup
```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Lint and format check
npm run check

# Auto-fix linting and formatting issues
npm run fix
```

### Frontend Development (`frontend/`)
```bash
cd frontend
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # ESLint check
```

### Backend Development (`server/`)
```bash
cd server
npm run dev:mock  # Start with mock data
npm run dev:aws   # Start with AWS HealthImaging
npm start         # Production mode
npm test          # Run Jest tests
```

### Infrastructure (`terraform/`)
```bash
cd terraform
terraform init     # Initialize (first time)
terraform plan     # Preview changes
terraform apply    # Deploy infrastructure
terraform destroy  # Clean up resources
terraform output healthimaging_datastore_id  # Get datastore ID
```

## API Testing
```bash
# Health check
curl http://localhost:3000/health

# Search (mock mode)
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"patientName": "John Doe", "modality": "CT"}'

# View metadata
curl "http://localhost:3000/view/mock-image-set-1"
```

## Development Workflow

1. Use mock mode (`npm run dev:mock`) for development without AWS dependencies
2. Backend runs on port 3000, frontend on port 5173 (Vite default)
3. Configuration profiles automatically load appropriate environment files
4. Medical imaging components use Cornerstone.js for DICOM rendering
5. Always run `npm run check` before committing to ensure code quality