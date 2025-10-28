import React, { useState, useCallback, useEffect } from 'react';
import HomePage from './components/HomePage';
import VnDetailPage from './components/VnDetailPage';
import { VisualNovel, Tag, SortOption } from './types';
import { searchVns } from './services/vndbService';

const resultsPerPage = 26;

const App: React.FC = () => {
  const [selectedVnId, setSelectedVnId] = useState<string | null>(null);

  // State lifted from HomePage for persistence
  const [vns, setVns] = useState<VisualNovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('votecount');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchVisualNovels = useCallback(async () => {
    // Don't fetch if we are viewing details
    if (selectedVnId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await searchVns(searchQuery, selectedTags, sortOption, currentPage, resultsPerPage);
      setVns(data.results);
      if (data.count) {
        setTotalPages(Math.ceil(data.count / resultsPerPage));
      } else {
        setTotalPages(0);
      }
    } catch (e) {
      setError('Failed to fetch visual novels. The API might be down or your request was throttled.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTags, sortOption, currentPage, selectedVnId]);

  // Effect to fetch data when search parameters change or when returning to the home page
  useEffect(() => {
    if (selectedVnId === null) {
      fetchVisualNovels();
    }
  }, [selectedVnId, fetchVisualNovels]);

  const handleVnSelect = useCallback((id: string) => {
    setSelectedVnId(id);
    window.scrollTo(0, 0);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedVnId(null);
  }, []);

  const handleSearch = useCallback(() => {
    // Setting page to 1 will trigger the fetch effect if the page is not already 1.
    // Otherwise, we need to trigger it manually.
    if (currentPage === 1) {
      fetchVisualNovels();
    } else {
      setCurrentPage(1);
    }
  }, [currentPage, fetchVisualNovels]);
  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <header className="bg-gray-800 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 
            className="text-2xl font-bold text-white cursor-pointer hover:text-indigo-400 transition-colors"
            onClick={handleBack}
            role="button"
            aria-disabled={!selectedVnId}
          >
            VNDB Explorer
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {selectedVnId ? (
          <VnDetailPage vnId={selectedVnId} onBack={handleBack} />
        ) : (
          <HomePage
            vns={vns}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTags={selectedTags}
            setSelectedTags={setSelectedTags}
            sortOption={sortOption}
            setSortOption={setSortOption}
            currentPage={currentPage}
            totalPages={totalPages}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onVnSelect={handleVnSelect}
          />
        )}
      </main>
      <footer className="text-center py-4 text-gray-500 text-sm">
        <p>Powered by the VNDB.org API</p>
      </footer>
    </div>
  );
};

export default App;