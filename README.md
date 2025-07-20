# DICOM HealthImaging POC

Proof of concept demonstrating React frontend integration with AWS HealthImaging service for medical imaging workflows.

## Architecture

- **React Frontend**: Search interface and results display
- **Express.js Backend**: RESTful API with AWS HealthImaging SDK integration  
- **Terraform Infrastructure**: HealthImaging datastore provisioning
- **Mock Mode**: Development mode with simulated data

## API Endpoints

- `POST /search` - Search DICOM image sets by metadata
- `GET /view/:id` - Get image set metadata for viewing
- `GET /view/:id/frame/:frameId` - Get specific image frame
- `GET /download/:id/frame/:frameId` - Download image frame
- `GET /health` - Health check endpoint

## Getting Started

### 1. Infrastructure Setup (Terraform)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 3. Backend Setup

```bash
cd server
npm install
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Testing the API

```bash
# Health check
curl http://localhost:3000/health

# Search for DICOM images (mock mode)
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "John Doe",
    "modality": "CT",
  }'

# View image set metadata
curl "http://localhost:3000/view/mock-image-set-1"
```

## License

This project is licensed under the MIT License.
