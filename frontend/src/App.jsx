import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Activity } from 'lucide-react';

import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import apiService from './services/api';
import logger from './services/logger';

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (searchParams) => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Starting search', searchParams);
      const response = await apiService.searchImageSets(searchParams);

      if (response.success) {
        setSearchResults(response.data.imageSetsMetadataSummaries || []);
        toast.success(`Found ${response.data.imageSetsMetadataSummaries?.length || 0} studies`);
        logger.info('Search completed successfully', {
          resultsCount: response.data.imageSetsMetadataSummaries?.length || 0,
        });
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to search studies';
      setError(errorMessage);
      toast.error(errorMessage);
      logger.error('Search failed', { error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center'>
              <Activity className='h-8 w-8 text-medical-600' />
              <h1 className='ml-3 text-xl font-semibold text-gray-900'>DICOM HealthImaging POC</h1>
            </div>
            <div className='text-sm text-gray-500'>AWS HealthImaging Demo</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-6'>
          {/* Search Form */}
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />

          {/* Results */}
          <ResultsTable results={searchResults} isLoading={isLoading} error={error} />
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
        toastClassName='text-sm'
      />
    </div>
  );
}

export default App;
