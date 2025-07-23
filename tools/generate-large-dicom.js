#!/usr/bin/env node

/**
 * Large DICOM File Generator (JavaScript/Node.js)
 * 
 * Creates large DICOM files with meaningful medical images for testing
 * your HTJ2K viewer with AWS HealthImaging.
 * 
 * Features:
 * - Pure JavaScript/Node.js (no Python required)
 * - Generates realistic anatomical structures
 * - Meaningful images you can see in the viewer
 * - Configurable file sizes (50MB to 1GB+)
 * - Multiple modalities (CT, MR, US)
 * 
 * Usage:
 *   node generate-large-dicom.js --size 100MB --output test_100mb.dcm
 *   node generate-large-dicom.js --size 500MB --modality MR --output brain_500mb.dcm
 */

import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    size: '100MB',
    output: 'test_large.dcm',
    modality: 'CT',
    patientName: 'Test^Patient'
  };
  
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (options.hasOwnProperty(key)) {
      options[key] = value;
    }
  }
  
  return options;
}

// Parse size string to bytes
function parseSize(sizeStr) {
  const size = sizeStr.toUpperCase();
  if (size.endsWith('MB')) {
    return parseInt(size.slice(0, -2)) * 1024 * 1024;
  } else if (size.endsWith('GB')) {
    return parseInt(size.slice(0, -2)) * 1024 * 1024 * 1024;
  } else if (size.endsWith('KB')) {
    return parseInt(size.slice(0, -2)) * 1024;
  }
  return parseInt(size);
}

// Calculate dimensions for target file size
function calculateDimensions(targetBytes) {
  const headerOverhead = 10 * 1024; // 10KB for DICOM headers
  const pixelDataSize = targetBytes - headerOverhead;
  const bytesPerPixel = 2; // 16-bit
  const totalPixels = Math.floor(pixelDataSize / bytesPerPixel);
  
  // Prefer medical imaging standard dimensions
  let width, height;
  
  if (totalPixels < 512 * 512) {
    const side = Math.floor(Math.sqrt(totalPixels));
    width = height = Math.max(256, side);
  } else if (totalPixels < 1024 * 1024) {
    width = 1024;
    height = Math.floor(totalPixels / width);
  } else if (totalPixels < 2048 * 2048) {
    width = 2048;
    height = Math.floor(totalPixels / width);
  } else {
    const side = Math.floor(Math.sqrt(totalPixels));
    width = height = Math.min(8192, side);
  }
  
  return { width: Math.max(256, width), height: Math.max(256, height) };
}

// Generate meaningful medical image data
function generateMedicalImage(width, height, modality) {
  console.log(`Generating ${width}x${height} ${modality} image with realistic anatomy...`);
  
  const pixels = new Uint16Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;
  
  if (modality === 'CT') {
    // CT Chest Cross-Section with realistic anatomy
    
    // Background (air around body)
    pixels.fill(0); // Air = 0 HU
    
    // Body outline (elliptical)
    const bodyRadiusX = width * 0.4;
    const bodyRadiusY = height * 0.35;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = (x - centerX) / bodyRadiusX;
        const dy = (y - centerY) / bodyRadiusY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        const idx = y * width + x;
        
        if (distFromCenter < 1.0) {
          // Inside body - soft tissue baseline
          pixels[idx] = 1024 + Math.floor(Math.random() * 200 - 100); // ~0 HU soft tissue
          
          // Lungs (dark, air-filled)
          const leftLungX = centerX - width * 0.15;
          const rightLungX = centerX + width * 0.15;
          const lungY = centerY - height * 0.05;
          const lungRadius = Math.min(width, height) * 0.12;
          
          const leftLungDist = Math.sqrt((x - leftLungX) ** 2 + (y - lungY) ** 2);
          const rightLungDist = Math.sqrt((x - rightLungX) ** 2 + (y - lungY) ** 2);
          
          if (leftLungDist < lungRadius || rightLungDist < lungRadius) {
            pixels[idx] = Math.floor(Math.random() * 200 + 100); // -900 to -700 HU (lung tissue)
          }
          
          // Heart (between lungs, slightly denser)
          const heartDist = Math.sqrt((x - centerX + width * 0.05) ** 2 + (y - centerY + height * 0.08) ** 2);
          if (heartDist < width * 0.08) {
            pixels[idx] = 1124 + Math.floor(Math.random() * 100); // ~100 HU heart muscle
          }
          
          // Spine (posterior, very dense)
          if (Math.abs(x - centerX) < width * 0.04 && y > centerY + height * 0.2) {
            pixels[idx] = 3024 + Math.floor(Math.random() * 500); // ~2000 HU bone
          }
          
          // Ribs (curved bones around lungs)
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI - Math.PI / 2;
            const ribCurve = Math.sin(angle * 2) * 0.1; // Curved ribs
            const ribX = centerX + Math.cos(angle) * (bodyRadiusX * 0.8) + ribCurve * width;
            const ribY = centerY + Math.sin(angle) * (bodyRadiusY * 0.7);
            const ribDist = Math.sqrt((x - ribX) ** 2 + (y - ribY) ** 2);
            
            if (ribDist < width * 0.015) {
              pixels[idx] = 2524 + Math.floor(Math.random() * 300); // ~1500 HU rib bone
            }
          }
          
          // Liver (right side, moderate density)
          const liverX = centerX + width * 0.15;
          const liverY = centerY + height * 0.15;
          const liverDist = Math.sqrt((x - liverX) ** 2 + (y - liverY) ** 2);
          if (liverDist < width * 0.1 && x > centerX) {
            pixels[idx] = 1074 + Math.floor(Math.random() * 50); // ~50 HU liver
          }
        }
      }
    }
    
  } else if (modality === 'MR') {
    // MR Brain Axial Slice with realistic anatomy
    
    // Background (air)
    pixels.fill(500); // Low signal
    
    // Brain outline (circular)
    const brainRadius = Math.min(width, height) * 0.35;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        const idx = y * width + x;
        
        if (distFromCenter < brainRadius) {
          // Inside brain
          
          // Gray matter (outer cortex)
          if (distFromCenter > brainRadius * 0.6) {
            pixels[idx] = 25000 + Math.floor(Math.random() * 5000); // High signal gray matter
          }
          
          // White matter (inner)
          else if (distFromCenter > brainRadius * 0.2) {
            pixels[idx] = 35000 + Math.floor(Math.random() * 3000); // Very high signal white matter
          }
          
          // Ventricles (CSF - dark)
          else {
            pixels[idx] = 8000 + Math.floor(Math.random() * 2000); // Low signal CSF
            
            // Lateral ventricles (butterfly shape)
            const ventriclePattern = Math.abs(Math.sin((Math.atan2(dy, dx) + Math.PI) * 2));
            if (ventriclePattern > 0.7 && distFromCenter < brainRadius * 0.15) {
              pixels[idx] = 5000 + Math.floor(Math.random() * 1000); // CSF in ventricles
            }
          }
          
          // Corpus callosum (bright white matter bridge)
          if (Math.abs(dy) < height * 0.02 && Math.abs(dx) < width * 0.08) {
            pixels[idx] = 45000 + Math.floor(Math.random() * 2000);
          }
          
          // Thalamus (deep gray matter)
          const thalamusDist = Math.sqrt(dx ** 2 + (dy + height * 0.05) ** 2);
          if (thalamusDist < width * 0.04) {
            pixels[idx] = 20000 + Math.floor(Math.random() * 3000);
          }
        }
        
        // Skull (bright rim around brain)
        if (distFromCenter > brainRadius && distFromCenter < brainRadius * 1.15) {
          pixels[idx] = 1000 + Math.floor(Math.random() * 500); // Low signal bone
        }
      }
    }
    
  } else if (modality === 'US') {
    // Ultrasound with organ structures and speckle
    
    // Base speckle pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        // Rayleigh distribution for speckle
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        pixels[idx] = Math.max(0, Math.floor(15000 + z * 5000));
      }
    }
    
    // Add organ structures
    
    // Liver (large organ on right)
    const liverCenterX = centerX + width * 0.1;
    const liverCenterY = centerY - height * 0.1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - liverCenterX;
        const dy = y - liverCenterY;
        const liverDist = Math.sqrt(dx ** 2 + dy ** 2);
        const idx = y * width + x;
        
        if (liverDist < width * 0.15) {
          pixels[idx] = Math.floor(pixels[idx] * 0.7 + 12000); // Slightly hypoechoic liver
        }
      }
    }
    
    // Gallbladder (anechoic - dark)
    const gbX = centerX + width * 0.2;
    const gbY = centerY;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const gbDist = Math.sqrt((x - gbX) ** 2 + (y - gbY) ** 2);
        const idx = y * width + x;
        
        if (gbDist < width * 0.04) {
          pixels[idx] = 2000 + Math.floor(Math.random() * 1000); // Anechoic gallbladder
        }
      }
    }
    
    // Blood vessel (anechoic tube)
    for (let x = 0; x < width; x++) {
      const vesselY = centerY + Math.sin(x * 0.02) * height * 0.1;
      for (let dy = -height * 0.015; dy <= height * 0.015; dy++) {
        const y = Math.floor(vesselY + dy);
        if (y >= 0 && y < height) {
          const idx = y * width + x;
          pixels[idx] = 1000 + Math.floor(Math.random() * 500); // Anechoic vessel
        }
      }
    }
  }
  
  return pixels;
}

// Generate DICOM file structure
function generateDicomFile(pixels, width, height, modality, patientName) {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
  
  // DICOM Data Elements (simplified but valid structure)
  const elements = [];
  
  // Helper to add DICOM element
  function addElement(tag, vr, value) {
    const tagBytes = Buffer.alloc(4);
    tagBytes.writeUInt16LE(parseInt(tag.slice(5, 9), 16), 0);
    tagBytes.writeUInt16LE(parseInt(tag.slice(1, 5), 16), 2);
    
    let valueBuffer;
    let length;
    
    if (vr === 'US') {
      valueBuffer = Buffer.alloc(2);
      valueBuffer.writeUInt16LE(value, 0);
      length = 2;
    } else if (vr === 'UL') {
      valueBuffer = Buffer.alloc(4);
      valueBuffer.writeUInt32LE(value, 0);
      length = 4;
    } else {
      // String types (PN, DA, TM, LO, etc.)
      valueBuffer = Buffer.from(value, 'ascii');
      length = valueBuffer.length;
      if (length % 2 === 1) {
        valueBuffer = Buffer.concat([valueBuffer, Buffer.from(' ')]);
        length++;
      }
    }
    
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32LE(length, 0);
    
    elements.push(Buffer.concat([
      tagBytes,
      Buffer.from(vr, 'ascii'),
      Buffer.alloc(2), // Reserved
      lengthBuffer,
      valueBuffer
    ]));
  }
  
  // Add essential DICOM elements
  addElement('(0008,0005)', 'CS', 'ISO_IR 100');
  addElement('(0008,0008)', 'CS', 'ORIGINAL\\PRIMARY\\AXIAL');
  addElement('(0008,0012)', 'DA', dateStr);
  addElement('(0008,0013)', 'TM', timeStr);
  addElement('(0008,0016)', 'UI', '1.2.840.10008.5.1.4.1.1.2'); // CT Image Storage
  addElement('(0008,0018)', 'UI', `1.2.3.4.5.${Date.now()}`);
  addElement('(0008,0020)', 'DA', dateStr);
  addElement('(0008,0030)', 'TM', timeStr);
  addElement('(0008,0050)', 'SH', 'ACC' + Date.now());
  addElement('(0008,0060)', 'CS', modality);
  addElement('(0008,0070)', 'LO', 'Large DICOM Generator');
  addElement('(0008,1030)', 'LO', `Large ${modality} Test Study`);
  
  // Patient Information
  addElement('(0010,0010)', 'PN', patientName);
  addElement('(0010,0020)', 'LO', `TEST_${modality}_${Date.now()}`);
  addElement('(0010,0030)', 'DA', '19800101');
  addElement('(0010,0040)', 'CS', 'O');
  
  // Study Information
  addElement('(0020,000D)', 'UI', `1.2.3.4.${Date.now()}.1`);
  addElement('(0020,000E)', 'UI', `1.2.3.4.${Date.now()}.2`);
  addElement('(0020,0010)', 'SH', '1');
  addElement('(0020,0011)', 'IS', '1');
  addElement('(0020,0013)', 'IS', '1');
  
  // Image Information
  addElement('(0028,0002)', 'US', 1); // Samples per pixel
  addElement('(0028,0004)', 'CS', 'MONOCHROME2');
  addElement('(0028,0010)', 'US', height); // Rows
  addElement('(0028,0011)', 'US', width); // Columns
  addElement('(0028,0100)', 'US', 16); // Bits Allocated
  addElement('(0028,0101)', 'US', 16); // Bits Stored
  addElement('(0028,0102)', 'US', 15); // High Bit
  addElement('(0028,0103)', 'US', 0); // Pixel Representation
  
  // Modality-specific elements
  if (modality === 'CT') {
    addElement('(0028,1050)', 'DS', '400'); // Window Center
    addElement('(0028,1051)', 'DS', '1000'); // Window Width
    addElement('(0028,1052)', 'DS', '-1024'); // Rescale Intercept
    addElement('(0028,1053)', 'DS', '1'); // Rescale Slope
  }
  
  // Create DICOM header
  const preamble = Buffer.alloc(128, 0);
  const dicmPrefix = Buffer.from('DICM', 'ascii');
  const header = Buffer.concat([preamble, dicmPrefix, ...elements]);
  
  // Pixel Data element
  const pixelDataTag = Buffer.from([0xE0, 0x7F, 0x10, 0x00]); // (7FE0,0010)
  const pixelDataVR = Buffer.from('OW');
  const pixelDataReserved = Buffer.alloc(2);
  const pixelDataLength = Buffer.alloc(4);
  pixelDataLength.writeUInt32LE(pixels.length * 2, 0);
  const pixelDataBuffer = Buffer.from(pixels.buffer);
  
  const pixelDataElement = Buffer.concat([
    pixelDataTag,
    pixelDataVR,
    pixelDataReserved,
    pixelDataLength,
    pixelDataBuffer
  ]);
  
  return Buffer.concat([header, pixelDataElement]);
}

// Main function
function main() {
  const options = parseArgs();
  const targetSize = parseSize(options.size);
  
  console.log(`🏥 Large DICOM Generator (JavaScript)`);
  console.log(`Target size: ${(targetSize / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`Modality: ${options.modality}`);
  console.log(`Output: ${options.output}`);
  
  // Calculate dimensions
  const { width, height } = calculateDimensions(targetSize);
  console.log(`Image dimensions: ${width} x ${height}`);
  
  // Generate meaningful medical image
  const pixels = generateMedicalImage(width, height, options.modality);
  
  // Create DICOM file
  console.log('Creating DICOM file structure...');
  const dicomBuffer = generateDicomFile(pixels, width, height, options.modality, options.patientName);
  
  // Ensure output directory exists
  const outputDir = path.dirname(options.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write file
  console.log('Writing DICOM file...');
  fs.writeFileSync(options.output, dicomBuffer);
  
  const finalSize = fs.statSync(options.output).size;
  console.log(`✅ Generated: ${options.output}`);
  console.log(`📁 File size: ${(finalSize / (1024 * 1024)).toFixed(1)} MB`);
  console.log(`📊 Difference from target: ${((finalSize - targetSize) / (1024 * 1024)).toFixed(1)} MB`);
  
  console.log(`\n💡 Image contains:`);
  if (options.modality === 'CT') {
    console.log('   - Realistic chest cross-section');
    console.log('   - Lungs, heart, ribs, spine');
    console.log('   - Proper HU values (-1000 to +3000)');
  } else if (options.modality === 'MR') {
    console.log('   - Brain axial slice');
    console.log('   - Gray matter, white matter, CSF');
    console.log('   - Ventricles and deep structures');
  } else if (options.modality === 'US') {
    console.log('   - Abdominal ultrasound');
    console.log('   - Liver, gallbladder, blood vessels');
    console.log('   - Realistic speckle pattern');
  }
  
  console.log(`\n🔼 Upload to AWS HealthImaging:`);
  console.log(`   aws s3 cp ${options.output} s3://your-bucket/`);
  console.log(`   aws medical-imaging import-dicom-data --datastore-id YOUR_ID --input-s3-uri s3://your-bucket/`);
}

// Handle command line usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}