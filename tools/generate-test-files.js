#!/usr/bin/env node

/**
 * Batch DICOM Test File Generator
 * 
 * Generates multiple large DICOM files with meaningful medical images
 * for testing your HTJ2K viewer with AWS HealthImaging.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const testFiles = [
  {
    size: '50MB',
    modality: 'CT',
    output: '../test-dicoms/ct_chest_50mb.dcm',
    patientName: 'TestPatient^CT50MB',
    description: 'CT chest with lungs, heart, ribs, spine'
  },
  {
    size: '100MB', 
    modality: 'CT',
    output: '../test-dicoms/ct_chest_100mb.dcm',
    patientName: 'TestPatient^CT100MB',
    description: 'Large CT chest cross-section'
  },
  {
    size: '150MB',
    modality: 'MR',
    output: '../test-dicoms/mr_brain_150mb.dcm',
    patientName: 'TestPatient^MR150MB',
    description: 'MR brain with gray/white matter, ventricles'
  },
  {
    size: '200MB',
    modality: 'CT',
    output: '../test-dicoms/ct_abdomen_200mb.dcm', 
    patientName: 'TestPatient^CT200MB',
    description: 'Large CT abdomen'
  },
  {
    size: '300MB',
    modality: 'MR',
    output: '../test-dicoms/mr_brain_300mb.dcm',
    patientName: 'TestPatient^MR300MB', 
    description: 'High-resolution MR brain'
  },
  {
    size: '500MB',
    modality: 'CT',
    output: '../test-dicoms/ct_thorax_500mb.dcm',
    patientName: 'TestPatient^CT500MB',
    description: 'Very large CT thorax for stress testing'
  },
  {
    size: '75MB',
    modality: 'US',
    output: '../test-dicoms/us_abdomen_75mb.dcm',
    patientName: 'TestPatient^US75MB',
    description: 'Ultrasound abdomen with liver, gallbladder'
  }
];

async function generateFile(fileConfig) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔨 Generating ${fileConfig.size} ${fileConfig.modality} file...`);
    console.log(`   📝 ${fileConfig.description}`);
    
    const args = [
      'generate-large-dicom.js',
      '--size', fileConfig.size,
      '--modality', fileConfig.modality,
      '--output', fileConfig.output,
      '--patientName', fileConfig.patientName
    ];
    
    const child = spawn('node', args, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Failed to generate ${fileConfig.output}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  console.log('🏥 Batch DICOM Test File Generator');
  console.log('==================================');
  console.log(`Generating ${testFiles.length} test files with meaningful medical images...\n`);
  
  // Create output directory
  const outputDir = path.resolve('../test-dicoms');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }
  
  let totalSize = 0;
  const startTime = Date.now();
  
  try {
    // Generate files sequentially to avoid memory issues
    for (let i = 0; i < testFiles.length; i++) {
      const fileConfig = testFiles[i];
      console.log(`\n[${i + 1}/${testFiles.length}] ${fileConfig.size} ${fileConfig.modality}`);
      
      await generateFile(fileConfig);
      
      // Check file size
      if (fs.existsSync(fileConfig.output)) {
        const size = fs.statSync(fileConfig.output).size;
        totalSize += size;
        console.log(`   ✅ Generated: ${(size / (1024 * 1024)).toFixed(1)} MB`);
      }
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('\n🎉 All files generated successfully!');
    console.log('=====================================');
    console.log(`📊 Total size: ${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
    console.log(`⏱️  Total time: ${duration.toFixed(1)} seconds`);
    
    console.log('\n📁 Generated files:');
    for (const fileConfig of testFiles) {
      if (fs.existsSync(fileConfig.output)) {
        const size = fs.statSync(fileConfig.output).size;
        const fileName = path.basename(fileConfig.output);
        console.log(`   ${fileName.padEnd(25)} ${(size / (1024 * 1024)).toFixed(1).padStart(6)} MB - ${fileConfig.description}`);
      }
    }
    
    console.log('\n💡 What you can see in these images:');
    console.log('====================================');
    console.log('CT Files:');
    console.log('  • Chest cross-sections with lungs (dark), heart, ribs, spine');
    console.log('  • Realistic Hounsfield Unit values (-1000 to +3000)');
    console.log('  • Anatomical structures you can recognize');
    console.log('');
    console.log('MR Files:');
    console.log('  • Brain axial slices with gray/white matter contrast');
    console.log('  • Ventricles (dark CSF), corpus callosum (bright)');
    console.log('  • T1-weighted appearance');
    console.log('');
    console.log('Ultrasound Files:');
    console.log('  • Abdominal scan with liver, gallbladder');
    console.log('  • Realistic speckle pattern');
    console.log('  • Blood vessels (dark/anechoic)');
    
    console.log('\n🔼 Upload to AWS HealthImaging:');
    console.log('===============================');
    console.log('1. Upload to S3:');
    console.log('   aws s3 sync ../test-dicoms s3://your-bucket/test-dicoms/');
    console.log('');
    console.log('2. Import to HealthImaging:');
    console.log('   aws medical-imaging import-dicom-data \\');
    console.log('     --datastore-id YOUR_DATASTORE_ID \\');
    console.log('     --input-s3-uri s3://your-bucket/test-dicoms/');
    console.log('');
    console.log('3. Test in your HTJ2K viewer with the returned image set IDs');
    
  } catch (error) {
    console.error('\n❌ Error generating files:', error.message);
    process.exit(1);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}