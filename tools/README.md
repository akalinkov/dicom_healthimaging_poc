# Large DICOM File Generator (JavaScript)

Generate large DICOM files with meaningful medical images for testing your HTJ2K viewer with AWS HealthImaging.

## ✨ Features

- **Pure JavaScript/Node.js** - No Python dependencies!
- **Meaningful Medical Images** - Realistic anatomical structures you can see
- **Multiple Modalities** - CT, MR, and Ultrasound
- **Configurable Sizes** - 10MB to 1GB+ files
- **Instant Generation** - Fast creation without external tools

## 🚀 Quick Start

### Generate Multiple Test Files (Recommended)

```bash
cd tools
node generate-test-files.js
```

This creates a complete test suite:
- **CT Files**: Chest cross-sections with lungs, heart, ribs, spine
- **MR Files**: Brain slices with gray/white matter, ventricles  
- **US Files**: Abdominal scans with liver, gallbladder

### Generate Individual Files

```bash
# 100MB CT chest scan
node generate-large-dicom.js --size 100MB --modality CT --output ct_100mb.dcm

# 500MB MR brain scan
node generate-large-dicom.js --size 500MB --modality MR --output brain_500mb.dcm

# 75MB Ultrasound abdomen
node generate-large-dicom.js --size 75MB --modality US --output us_75mb.dcm
```

## 🏥 What You'll See in These Images

### CT Scans (Chest Cross-Section)
```
    🫁 Lungs (dark, air-filled)
    ❤️  Heart (between lungs)
    🦴 Ribs (curved bones)
    🦴 Spine (posterior, very bright)
    🫀 Soft tissues (gray)
```
- **Realistic HU values**: Air (-1000), Soft tissue (~0), Bone (+2000)
- **Recognizable anatomy** you can identify in the viewer

### MR Scans (Brain Axial Slice)  
```
    🧠 Gray matter (outer, bright)
    🧠 White matter (inner, very bright)
    💧 CSF/Ventricles (dark)
    🔗 Corpus callosum (bright bridge)
```
- **T1-weighted appearance** with realistic brain contrast
- **Butterfly-shaped ventricles** clearly visible

### Ultrasound Scans (Abdomen)
```
    🫘 Liver (slightly dark)
    🟢 Gallbladder (dark, anechoic)
    🩸 Blood vessels (dark tubes)
    ✨ Speckle pattern throughout
```
- **Realistic speckle** texture characteristic of ultrasound
- **Anechoic structures** (gallbladder, vessels) appear dark

## 📊 Generated File Sizes

| Size | Typical Dimensions | Memory Usage | Use Case |
|------|-------------------|--------------|----------|
| 50MB | 1600×1600 | ~50MB RAM | Basic testing |
| 100MB | 2300×2300 | ~100MB RAM | Standard large file |
| 200MB | 3200×3200 | ~200MB RAM | Memory pressure test |
| 500MB | 5100×5100 | ~500MB RAM | Stress testing |

## 🔼 Upload to AWS HealthImaging

### 1. Upload to S3

```bash
# Upload all test files
aws s3 sync test-dicoms/ s3://your-dicom-bucket/test-files/

# Or upload individual file
aws s3 cp ct_100mb.dcm s3://your-dicom-bucket/
```

### 2. Import to HealthImaging

```bash
aws medical-imaging import-dicom-data \
    --datastore-id YOUR_DATASTORE_ID \
    --input-s3-uri s3://your-dicom-bucket/test-files/ \
    --output-s3-uri s3://your-dicom-bucket/output/
```

### 3. Get Image Set IDs

```bash
# Find your imported images
aws medical-imaging search-image-sets \
    --datastore-id YOUR_DATASTORE_ID \
    --search-criteria '{"filters": [{"values": [{"DICOMPatientName": "TestPatient^CT100MB"}], "operator": "EQUAL"}]}'
```

## 🧪 Testing Your HTJ2K Viewer

These files are perfect for testing:

### ✅ **Functionality Testing**
- **Visible Results**: You can see if images load correctly (not just test patterns)
- **Different Contrasts**: CT (high contrast), MR (soft contrast), US (speckle)
- **Anatomical Validation**: Verify structures appear correctly

### ✅ **Performance Testing**  
- **50-100MB**: Standard medical file sizes
- **200-300MB**: Large file handling
- **500MB+**: Stress testing, memory limits

### ✅ **User Experience Testing**
- **Meaningful Content**: Reviewers can assess image quality
- **Medical Context**: Realistic medical imaging workflow
- **Visual Validation**: Easy to spot rendering issues

## 🛠️ Advanced Usage

### Custom Patient Names
```bash
node generate-large-dicom.js \
    --size 200MB \
    --modality MR \
    --patientName "Smith^John" \
    --output patient_john_smith.dcm
```

### Batch Custom Generation
Edit `generate-test-files.js` to add your custom configurations:

```javascript
const customFiles = [
  {
    size: '150MB',
    modality: 'CT', 
    output: '../my-tests/custom_ct.dcm',
    patientName: 'Custom^Patient',
    description: 'My custom CT scan'
  }
];
```

## 💡 Pro Tips

1. **Start Small**: Begin with 50-100MB files for development
2. **Test Incrementally**: Gradually increase to 500MB+ for stress testing  
3. **Watch Memory**: Monitor browser memory usage with large files
4. **Meaningful Names**: Use descriptive filenames for easy identification
5. **Multiple Modalities**: Test different image types (CT sharp, MR soft, US speckle)

## 🔍 Troubleshooting

### Files too small/large?
The generator estimates size. Final size may vary ±5% due to compression and header overhead.

### Out of memory?
For very large files (>1GB), ensure sufficient system RAM during generation.

### Invalid DICOM?
All generated files include proper DICOM headers and are valid for medical imaging systems.

---

These files will give you **realistic, meaningful medical images** to properly test your HTJ2K viewer! 🏥✨