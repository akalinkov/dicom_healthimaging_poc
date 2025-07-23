#!/bin/bash

# Generate Large DICOM Test Files
# 
# This script generates various sized DICOM files for testing
# your HTJ2K viewer with AWS HealthImaging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏥 Large DICOM File Generator${NC}"
echo "Generating test files for AWS HealthImaging..."

# Create output directory
mkdir -p ../test-dicoms

# Check if Python dependencies are installed
echo -e "${YELLOW}📦 Checking dependencies...${NC}"
if ! python3 -c "import pydicom, PIL, numpy" 2>/dev/null; then
    echo -e "${YELLOW}Installing Python dependencies...${NC}"
    pip3 install -r requirements.txt
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo

# Generate different sized files
echo -e "${YELLOW}🔨 Generating DICOM files...${NC}"

# 100MB CT scan
echo "Generating 100MB CT scan..."
python3 generate_large_dicom.py \
    --size 100MB \
    --modality CT \
    --patient-name "TestPatient^CT100MB" \
    --output ../test-dicoms/ct_100mb.dcm

# 200MB MR scan  
echo "Generating 200MB MR scan..."
python3 generate_large_dicom.py \
    --size 200MB \
    --modality MR \
    --patient-name "TestPatient^MR200MB" \
    --output ../test-dicoms/mr_200mb.dcm

# 500MB CT scan
echo "Generating 500MB CT scan..."
python3 generate_large_dicom.py \
    --size 500MB \
    --modality CT \
    --patient-name "TestPatient^CT500MB" \
    --output ../test-dicoms/ct_500mb.dcm

# 50MB Ultrasound (smaller for comparison)
echo "Generating 50MB Ultrasound..."
python3 generate_large_dicom.py \
    --size 50MB \
    --modality US \
    --patient-name "TestPatient^US50MB" \
    --output ../test-dicoms/us_50mb.dcm

echo
echo -e "${GREEN}✅ All files generated successfully!${NC}"
echo
echo -e "${YELLOW}📁 Generated files:${NC}"
ls -lh ../test-dicoms/

echo
echo -e "${YELLOW}💡 Usage Tips:${NC}"
echo "1. Upload these files to AWS HealthImaging using the AWS CLI"
echo "2. Use the imageSetId in your HTJ2K viewer for testing"
echo "3. Monitor memory usage and performance with larger files"
echo
echo -e "${YELLOW}📤 To upload to AWS HealthImaging:${NC}"
echo "aws medical-imaging import-dicom-data \\"
echo "    --datastore-id YOUR_DATASTORE_ID \\"
echo "    --input-s3-uri s3://your-bucket/dicom-files/"