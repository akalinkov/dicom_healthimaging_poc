// server/config/mock.config.js

export default {
  useMockData: true,
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    datastoreId: process.env.HEALTHIMAGING_DATASTORE_ID,
  },
  
  server: {
    port: process.env.PORT || 3000,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },

  mockData: {
    imageSets: [
      {
        imageSetId: 'mock-image-set-1',
        version: 1,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
        seriesCount: 3,
        imageCount: 150,
        imageSizeInBytes: 125000000, // ~119 MB
        DICOMTags: {
          DICOMPatientName: 'John Doe',
          DICOMPatientId: '12345',
          DICOMStudyDate: '20240101',
          DICOMModality: 'CT',
          DICOMStudyDescription: 'Chest CT Scan',
          DICOMStudyInstanceUID: '1.2.3.4.5.6.7.8.9.0.1',
          DICOMAccessionNumber: 'ACC001',
        },
      },
      {
        imageSetId: 'mock-image-set-2',
        version: 1,
        createdAt: new Date('2024-01-02').toISOString(),
        updatedAt: new Date('2024-01-02').toISOString(),
        seriesCount: 2,
        imageCount: 85,
        imageSizeInBytes: 89600000, // ~85.4 MB
        DICOMTags: {
          DICOMPatientName: 'Jane Smith',
          DICOMPatientId: '67890',
          DICOMStudyDate: '20240102',
          DICOMModality: 'MRI',
          DICOMStudyDescription: 'Brain MRI',
          DICOMStudyInstanceUID: '1.2.3.4.5.6.7.8.9.0.2',
          DICOMAccessionNumber: 'ACC002',
        },
      },
      {
        imageSetId: 'mock-image-set-3',
        version: 1,
        createdAt: new Date('2024-01-03').toISOString(),
        updatedAt: new Date('2024-01-03').toISOString(),
        seriesCount: 1,
        imageCount: 2,
        imageSizeInBytes: 2400000, // ~2.3 MB
        DICOMTags: {
          DICOMPatientName: 'Bob Johnson',
          DICOMPatientId: '11111',
          DICOMStudyDate: '20240103',
          DICOMModality: 'XR',
          DICOMStudyDescription: 'Chest X-Ray',
          DICOMStudyInstanceUID: '1.2.3.4.5.6.7.8.9.0.3',
          DICOMAccessionNumber: 'ACC003',
        },
      },
      {
        imageSetId: 'mock-image-set-4',
        version: 1,
        createdAt: new Date('2024-01-04').toISOString(),
        updatedAt: new Date('2024-01-04').toISOString(),
        seriesCount: 4,
        imageCount: 200,
        imageSizeInBytes: 156000000, // ~148.8 MB
        DICOMTags: {
          DICOMPatientName: 'Alice Cooper',
          DICOMPatientId: '22222',
          DICOMStudyDate: '20240104',
          DICOMModality: 'CT',
          DICOMStudyDescription: 'Abdominal CT',
          DICOMStudyInstanceUID: '1.2.3.4.5.6.7.8.9.0.4',
          DICOMAccessionNumber: 'ACC004',
        },
      },
    ],

    metadata: {
      patient: {
        name: 'John Doe',
        id: '12345',
        birthDate: '1980-01-01',
        sex: 'M',
      },
      study: {
        date: '20240101',
        time: '120000',
        description: 'Sample CT Study',
        instanceUID: '1.2.3.4.5.6.7.8.9.0.1',
      },
      series: [
        {
          instanceUID: '1.2.3.4.5.6.7.8.9.0.2',
          modality: 'CT',
          description: 'Axial CT Images',
          imageCount: 100,
          frameUrls: Array.from({ length: 10 }, (_, i) => `/download/mock-image-set-1/frame/${i + 1}`),
        },
      ],
    },
  },
};