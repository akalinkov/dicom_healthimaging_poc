# DICOM HealthImaging POC

## Project Overview

This is a Proof of Concept (POC) project that demonstrates the integration of a Single Page Application (SPA) with AWS HealthImaging service. The project aims to validate the feasibility of building a medical imaging solution that can interact with DICOM datastores in AWS.

## Objectives

The primary goals of this POC are to:

1. **Search Functionality**: Confirm the ability to search a DICOM datastore for medical images using metadata criteria
2. **Image Viewing**: Demonstrate the capability to retrieve and display DICOM files in a web-based user interface
3. **AWS Integration**: Validate the integration patterns between a web application and AWS HealthImaging services

## Key Features

- Search DICOM studies and series by metadata (patient ID, study date, modality, etc.)
- Retrieve and display medical images in a web browser
- Demonstrate secure access to AWS HealthImaging resources
- Provide a foundation for future medical imaging application development

## Technology Stack

- **Frontend**: Single Page Application (SPA)
- **Backend**: AWS HealthImaging
- **Cloud Platform**: Amazon Web Services (AWS)
- **Image Format**: DICOM (Digital Imaging and Communications in Medicine)

## Use Cases

This POC addresses common medical imaging workflows:
- Radiologists searching for patient studies
- Viewing medical images for diagnostic purposes
- Integrating medical imaging into healthcare applications

## Project Status

This is a proof of concept project intended to validate technical feasibility and integration patterns with AWS HealthImaging.

## Prerequisites

- AWS Account with HealthImaging service access
- DICOM test data imported into AWS HealthImaging datastore
- Appropriate AWS IAM permissions for HealthImaging operations

## Architecture

This POC consists of:

- **Terraform Infrastructure**: IAM policies and users with least privilege access
- **Express.js Backend**: RESTful API with AWS HealthImaging SDK integration
- **Docker Setup**: Containerized development environment
- **Mock Mode**: Development mode with simulated responses

## API Endpoints

- `POST /search` - Search DICOM image sets by metadata
- `GET /view/:id` - Get image set metadata for viewing
- `GET /view/:id/frame/:frameId` - Get specific image frame
- `GET /download/:id/frame/:frameId` - Download image frame
- `GET /health` - Health check endpoint

## Getting Started

### 1. Infrastructure Setup (Terraform)

```bash
# Initialize Terraform
terraform init

# Plan the infrastructure
terraform plan

# Apply the infrastructure
terraform apply

# Get the AWS credentials (sensitive output)
terraform output -json
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Add the AWS credentials from Terraform output to .env
# AWS_ACCESS_KEY_ID=your_access_key_here
# AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

### 3. Local Development (Docker)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run without Docker:
cd server
npm install
npm run dev
```

### 4. Local Development (Node.js)

```bash
cd server
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
    "datastoreId": "test-datastore"
  }'

# View image set metadata
curl "http://localhost:3000/view/mock-image-set-1?datastoreId=test-datastore"
```

## License

_License information to be determined._
