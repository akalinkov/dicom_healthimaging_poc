import { Eye, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import logger from '../services/logger.js';

const ModalityBadge = ({ modality }) => {
  const colors = {
    CT: 'bg-blue-100 text-blue-800',
    MRI: 'bg-purple-100 text-purple-800',
    XR: 'bg-green-100 text-green-800',
    US: 'bg-yellow-100 text-yellow-800',
    MG: 'bg-pink-100 text-pink-800',
    PT: 'bg-red-100 text-red-800',
    NM: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[modality] || colors.NM}`}
    >
      {modality}
    </span>
  );
};

const ResultsTable = ({ results, isLoading, error }) => {
  const handleView = (imageSet) => {
    logger.info('View image set requested', { imageSetId: imageSet.imageSetId });
    toast.info(`Opening viewer for ${imageSet.DICOMTags.DICOMPatientName}`);
    // TODO: Implement actual viewer
  };

  const handleDownload = (imageSet) => {
    logger.info('Download image set requested', { imageSetId: imageSet.imageSetId });
    toast.success(`Download started for ${imageSet.DICOMTags.DICOMPatientName}`);
    // TODO: Implement actual download
  };

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-8'>
        <div className='flex items-center justify-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600'></div>
          <span className='ml-3 text-gray-600'>Searching for studies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-lg border border-red-200 p-8'>
        <div className='text-center'>
          <div className='text-red-600 text-lg font-medium mb-2'>Search Error</div>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-8'>
        <div className='text-center'>
          <div className='text-gray-400 text-lg font-medium mb-2'>No studies found</div>
          <p className='text-gray-500'>Try adjusting your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden'>
      <div className='px-6 py-4 border-b border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900'>
          Search Results ({results.length} studies found)
        </h3>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Patient
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Modality
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Study Date
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Description
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Accession
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {results.map((imageSet) => (
              <tr key={imageSet.imageSetId} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div>
                    <div className='text-sm font-medium text-gray-900'>
                      {imageSet.DICOMTags.DICOMPatientName}
                    </div>
                    <div className='text-sm text-gray-500'>
                      ID: {imageSet.DICOMTags.DICOMPatientId}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <ModalityBadge modality={imageSet.DICOMTags.DICOMModality} />
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {imageSet.DICOMTags.DICOMStudyDate}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                  {imageSet.DICOMTags.DICOMStudyDescription || 'N/A'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                  {imageSet.DICOMTags.DICOMAccessionNumber || 'N/A'}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <div className='flex justify-end space-x-2'>
                    <button
                      onClick={() => handleView(imageSet)}
                      className='inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-medical-700 bg-medical-100 hover:bg-medical-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 transition-colors'
                    >
                      <Eye className='h-4 w-4 mr-1' />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(imageSet)}
                      className='inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 transition-colors'
                    >
                      <Download className='h-4 w-4 mr-1' />
                      Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
