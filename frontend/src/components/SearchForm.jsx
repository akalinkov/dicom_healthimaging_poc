import { useState } from 'react';
import { Search } from 'lucide-react';
import logger from '../services/logger.js';

const SearchForm = ({ onSearch, isLoading }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    modality: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.patientName && !formData.modality) {
      logger.warn('Search attempted with no criteria', formData);
      return;
    }

    logger.info('Search form submitted', formData);
    onSearch(formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className='bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-6'>
      <div className='flex items-center mb-4'>
        <Search className='h-5 w-5 text-medical-600 mr-2' />
        <h2 className='text-lg font-semibold text-gray-900'>Search DICOM Studies</h2>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* Patient Name */}
          <div>
            <label htmlFor='patientName' className='block text-sm font-medium text-gray-700 mb-1'>
              Patient Name
            </label>
            <input
              type='text'
              id='patientName'
              name='patientName'
              value={formData.patientName}
              onChange={handleInputChange}
              placeholder='Enter patient name'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors'
            />
          </div>

          {/* Modality */}
          <div>
            <label htmlFor='modality' className='block text-sm font-medium text-gray-700 mb-1'>
              Modality
            </label>
            <select
              id='modality'
              name='modality'
              value={formData.modality}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-medical-500 transition-colors'
            >
              <option value=''>All Modalities</option>
              <option value='CT'>CT - Computed Tomography</option>
              <option value='MRI'>MRI - Magnetic Resonance Imaging</option>
              <option value='XR'>XR - X-Ray</option>
              <option value='US'>US - Ultrasound</option>
              <option value='MG'>MG - Mammography</option>
              <option value='PT'>PT - Positron Emission Tomography</option>
              <option value='NM'>NM - Nuclear Medicine</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className='flex justify-end'>
          <button
            type='submit'
            disabled={isLoading}
            className='inline-flex items-center px-4 py-2 bg-medical-600 text-white font-medium rounded-md hover:bg-medical-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          >
            {isLoading ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                Searching...
              </>
            ) : (
              <>
                <Search className='h-4 w-4 mr-2' />
                Search
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
