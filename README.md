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
# Navigate to terraform directory
cd terraform

# Initialize Terraform
terraform init

# Plan the infrastructure
terraform plan

# Apply the infrastructure
terraform apply

# Get the AWS credentials (sensitive output)
terraform output -json

# Return to project root
cd ..
```

### 2. AWS Authentication

The application uses AWS credentials discovery chain. Choose one method:

**Option A: AWS SSO (Recommended for development)**

```bash
# Configure AWS SSO
aws configure sso

# Login to create temporary credentials
aws sso login
```

**Option B: AWS CLI Profile**

```bash
# Configure AWS CLI with your credentials
aws configure --profile dicom-poc

# Set the profile in your environment
export AWS_PROFILE=dicom-poc
```

**Option C: Environment Variables (if needed)**

```bash
# Copy the example environment file
cp .env.example .env
# Edit .env to add AWS_REGION and HEALTHIMAGING_DATASTORE_ID
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
    "datastoreId": "test-datastore"
  }'

# View image set metadata
curl "http://localhost:3000/view/mock-image-set-1?datastoreId=test-datastore"
```

## License

_License information to be determined._
