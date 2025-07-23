#!/usr/bin/env python3
"""
Large DICOM File Generator for Testing AWS HealthImaging

This script generates large DICOM files of various sizes for testing
your HTJ2K viewer implementation with AWS HealthImaging.

Requirements:
    pip install pydicom pillow numpy

Usage:
    python generate_large_dicom.py --size 100MB --output test_100mb.dcm
    python generate_large_dicom.py --size 500MB --modality MR --output test_mr_500mb.dcm
"""

import argparse
import os
import sys
from datetime import datetime, date
import numpy as np
from PIL import Image
import pydicom
from pydicom.dataset import Dataset, FileMetaDataset
from pydicom.uid import UID, generate_uid
import pydicom.uid

def parse_size(size_str):
    """Parse size string like '100MB', '1GB' into bytes"""
    size_str = size_str.upper().strip()
    
    if size_str.endswith('MB'):
        return int(float(size_str[:-2]) * 1024 * 1024)
    elif size_str.endswith('GB'):
        return int(float(size_str[:-2]) * 1024 * 1024 * 1024)
    elif size_str.endswith('KB'):
        return int(float(size_str[:-2]) * 1024)
    else:
        # Assume bytes
        return int(size_str)

def calculate_dimensions(target_size_bytes, bits_per_pixel=16):
    """Calculate image dimensions to achieve target file size"""
    
    # Account for DICOM header overhead (typically 2-10KB)
    header_overhead = 10 * 1024  # 10KB overhead
    pixel_data_size = target_size_bytes - header_overhead
    
    # Calculate total pixels needed
    bytes_per_pixel = bits_per_pixel // 8
    total_pixels = pixel_data_size // bytes_per_pixel
    
    # For medical images, prefer square or rectangular dimensions
    # that are powers of 2 or multiples of common medical image sizes
    
    if total_pixels < 512 * 512:
        # Small image
        width = height = int(np.sqrt(total_pixels))
    elif total_pixels < 1024 * 1024:
        # Medium image - try 1024x512 or similar
        width = 1024
        height = total_pixels // width
    elif total_pixels < 2048 * 2048:
        # Large image - try 2048x1024 or similar
        width = 2048
        height = total_pixels // width
    else:
        # Very large image - calculate square dimensions
        side = int(np.sqrt(total_pixels))
        width = height = side
    
    # Ensure dimensions are reasonable
    width = max(256, min(8192, width))
    height = max(256, min(8192, height))
    
    return width, height

def generate_realistic_medical_image(width, height, modality='CT'):
    """Generate realistic-looking medical image data"""
    
    print(f"Generating {width}x{height} {modality} image data...")
    
    if modality == 'CT':
        # CT scan - simulate body cross-section with bones, organs, air
        image = np.zeros((height, width), dtype=np.uint16)
        
        # Create circular body outline
        center_y, center_x = height // 2, width // 2
        y, x = np.ogrid[:height, :width]
        
        # Body (soft tissue)
        body_mask = (x - center_x)**2 + (y - center_y)**2 < (min(width, height) * 0.4)**2
        image[body_mask] = np.random.normal(1000, 200, np.sum(body_mask)).astype(np.uint16)
        
        # Bones (higher density)
        bone_regions = []
        # Spine
        spine_mask = (np.abs(x - center_x) < width * 0.05) & (y > center_y * 0.5) & (y < center_y * 1.5)
        image[spine_mask] = np.random.normal(3000, 300, np.sum(spine_mask)).astype(np.uint16)
        
        # Ribs
        for angle in np.linspace(0, np.pi, 8):
            rib_x = center_x + np.cos(angle) * width * 0.3
            rib_y = center_y + np.sin(angle) * height * 0.2
            rib_mask = ((x - rib_x)**2 + (y - rib_y)**2) < (width * 0.02)**2
            image[rib_mask] = np.random.normal(2800, 200, np.sum(rib_mask)).astype(np.uint16)
        
        # Air (lungs)
        lung_left = ((x - center_x + width * 0.15)**2 + (y - center_y)**2) < (width * 0.12)**2
        lung_right = ((x - center_x - width * 0.15)**2 + (y - center_y)**2) < (width * 0.12)**2
        image[lung_left | lung_right] = np.random.normal(-1000, 100, np.sum(lung_left | lung_right)).astype(np.uint16)
        
        # Ensure values are in valid range
        image = np.clip(image, 0, 65535)
        
    elif modality == 'MR':
        # MRI - different contrast and noise characteristics
        image = np.zeros((height, width), dtype=np.uint16)
        
        # Create brain-like structure
        center_y, center_x = height // 2, width // 2
        y, x = np.ogrid[:height, :width]
        
        # Brain outline
        brain_mask = (x - center_x)**2 + (y - center_y)**2 < (min(width, height) * 0.35)**2
        
        # Gray matter
        gray_matter = brain_mask & (((x - center_x)**2 + (y - center_y)**2) > (min(width, height) * 0.15)**2)
        image[gray_matter] = np.random.normal(30000, 3000, np.sum(gray_matter)).astype(np.uint16)
        
        # White matter
        white_matter = brain_mask & (((x - center_x)**2 + (y - center_y)**2) <= (min(width, height) * 0.15)**2)
        image[white_matter] = np.random.normal(45000, 2000, np.sum(white_matter)).astype(np.uint16)
        
        # CSF (darker)
        csf_regions = brain_mask & (np.random.random((height, width)) < 0.05)
        image[csf_regions] = np.random.normal(10000, 1000, np.sum(csf_regions)).astype(np.uint16)
        
        # Ensure values are in valid range
        image = np.clip(image, 0, 65535)
        
    elif modality == 'US':
        # Ultrasound - speckle pattern
        image = np.random.rayleigh(20000, (height, width)).astype(np.uint16)
        
        # Add some structure
        center_y, center_x = height // 2, width // 2
        y, x = np.ogrid[:height, :width]
        
        # Simulated organ boundaries
        for i in range(3):
            organ_x = center_x + np.random.randint(-width//4, width//4)
            organ_y = center_y + np.random.randint(-height//4, height//4)
            organ_mask = ((x - organ_x)**2 + (y - organ_y)**2) < (min(width, height) * 0.1)**2
            image[organ_mask] += np.random.normal(15000, 5000, np.sum(organ_mask)).astype(np.uint16)
        
        # Ensure values are in valid range
        image = np.clip(image, 0, 65535)
        
    else:
        # Generic medical image
        image = np.random.normal(25000, 10000, (height, width)).astype(np.uint16)
        image = np.clip(image, 0, 65535)
    
    return image

def create_dicom_file(output_path, target_size, modality='CT', patient_name="Test^Patient"):
    """Create a DICOM file with specified target size"""
    
    print(f"Creating {modality} DICOM file: {output_path}")
    print(f"Target size: {target_size / (1024*1024):.1f} MB")
    
    # Calculate dimensions needed
    width, height = calculate_dimensions(target_size)
    print(f"Image dimensions: {width} x {height}")
    
    # Generate image data
    pixel_array = generate_realistic_medical_image(width, height, modality)
    
    # Create DICOM dataset
    ds = Dataset()
    
    # File Meta Information
    file_meta = FileMetaDataset()
    file_meta.MediaStorageSOPClassUID = pydicom.uid.CTImageStorage if modality == 'CT' else pydicom.uid.MRImageStorage
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.TransferSyntaxUID = pydicom.uid.ExplicitVRLittleEndian
    file_meta.ImplementationClassUID = generate_uid()
    file_meta.ImplementationVersionName = "LARGE_DICOM_GEN_1.0"
    
    ds.file_meta = file_meta
    
    # Required DICOM elements
    ds.SOPClassUID = file_meta.MediaStorageSOPClassUID
    ds.SOPInstanceUID = file_meta.MediaStorageSOPInstanceUID
    
    # Patient Information
    ds.PatientName = patient_name
    ds.PatientID = f"TEST_{modality}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    ds.PatientBirthDate = "19800101"
    ds.PatientSex = "O"
    
    # Study Information
    ds.StudyInstanceUID = generate_uid()
    ds.StudyID = "1"
    ds.StudyDate = date.today().strftime('%Y%m%d')
    ds.StudyTime = datetime.now().strftime('%H%M%S')
    ds.StudyDescription = f"Large {modality} Test Study"
    ds.AccessionNumber = f"ACC{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Series Information
    ds.SeriesInstanceUID = generate_uid()
    ds.SeriesNumber = 1
    ds.SeriesDate = ds.StudyDate
    ds.SeriesTime = ds.StudyTime
    ds.SeriesDescription = f"Large {modality} Test Series"
    ds.Modality = modality
    
    # Instance Information
    ds.InstanceNumber = 1
    ds.ContentDate = ds.StudyDate
    ds.ContentTime = ds.StudyTime
    
    # Image Information
    ds.ImageType = ["ORIGINAL", "PRIMARY", "AXIAL"]
    ds.SamplesPerPixel = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.Rows = height
    ds.Columns = width
    ds.BitsAllocated = 16
    ds.BitsStored = 16
    ds.HighBit = 15
    ds.PixelRepresentation = 0  # Unsigned
    
    # Modality-specific settings
    if modality == 'CT':
        ds.RescaleIntercept = -1024
        ds.RescaleSlope = 1
        ds.WindowCenter = 400
        ds.WindowWidth = 1000
        ds.SliceThickness = 1.0
        ds.PixelSpacing = [0.5, 0.5]
        ds.KVP = 120
    elif modality == 'MR':
        ds.RescaleIntercept = 0
        ds.RescaleSlope = 1
        ds.WindowCenter = 32768
        ds.WindowWidth = 65536
        ds.SliceThickness = 2.0
        ds.PixelSpacing = [0.8, 0.8]
        ds.MagneticFieldStrength = 1.5
        ds.RepetitionTime = 500
        ds.EchoTime = 15
    elif modality == 'US':
        ds.RescaleIntercept = 0
        ds.RescaleSlope = 1
        ds.WindowCenter = 32768
        ds.WindowWidth = 65536
        
    # Equipment Information
    ds.Manufacturer = "Large DICOM Generator"
    ds.ManufacturerModelName = "Test Generator v1.0"
    ds.SoftwareVersions = "1.0"
    ds.InstitutionName = "Test Institution"
    ds.StationName = "TEST_STATION"
    
    # Add pixel data
    ds.PixelData = pixel_array.tobytes()
    
    # Save the file
    print(f"Saving DICOM file...")
    ds.save_as(output_path, write_like_original=False)
    
    # Check final file size
    final_size = os.path.getsize(output_path)
    print(f"Generated file size: {final_size / (1024*1024):.1f} MB")
    print(f"Difference from target: {(final_size - target_size) / (1024*1024):.1f} MB")
    
    return final_size

def main():
    parser = argparse.ArgumentParser(description='Generate large DICOM files for testing')
    parser.add_argument('--size', required=True, help='Target file size (e.g., 100MB, 500MB, 1GB)')
    parser.add_argument('--output', required=True, help='Output DICOM file path')
    parser.add_argument('--modality', default='CT', choices=['CT', 'MR', 'US'], 
                       help='DICOM modality (default: CT)')
    parser.add_argument('--patient-name', default='Test^Patient', 
                       help='Patient name (default: Test^Patient)')
    
    args = parser.parse_args()
    
    try:
        target_size = parse_size(args.size)
        print(f"Target size: {target_size:,} bytes ({target_size/(1024*1024):.1f} MB)")
        
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        
        final_size = create_dicom_file(
            args.output, 
            target_size, 
            args.modality, 
            args.patient_name
        )
        
        print(f"\n✅ Successfully created {args.output}")
        print(f"📁 File size: {final_size:,} bytes ({final_size/(1024*1024):.1f} MB)")
        print(f"🏥 Modality: {args.modality}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()