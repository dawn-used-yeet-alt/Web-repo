import React, { useState, useEffect, useCallback } from 'react';
import { getVnById } from '../services/vndbService';
import { VisualNovel } from '../types';
import Spinner from './Spinner';
import TagBadge from './TagBadge';
import ImageViewer from './ImageViewer';

interface VnDetailPageProps {
  vnId: string;
  onBack: () => void;
}

const VnDetailPage: React.FC<VnDetailPageProps> = ({ vnId, onBack }) => {
  const [vn, setVn] = useState<VisualNovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchVn = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getVnById(vnId);
        setVn(data);
      } catch (e) {
        setError('Failed to fetch visual novel details.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchVn();
  }, [vnId]);
  
  const handleNextImage = useCallback(() => {
    if (vn && viewingImageIndex !== null && viewingImageIndex < vn.screenshots.length - 1) {
      setViewingImageIndex(viewingImageIndex + 1);
    }
  }, [vn, viewingImageIndex]);

  const handlePrevImage = useCallback(() => {
    if (viewingImageIndex !== null && viewingImageIndex > 0) {
      setViewingImageIndex(viewingImageIndex - 1);
    }
  }, [viewingImageIndex]);


  const renderDescription = (desc: string | null | undefined) => {
    if (!desc) return <p className="text-gray-400 italic">No description available.</p>;
    
    // Improved parser for VNDB's BBCode-like [url] tags
    const urlRegex = /\[url=(.*?)\]([\s\S]*?)\[\/url\]/g;

    return desc.split('\n').map((paragraph, pIndex) => {
        // FIX: Use React.ReactNode which is a more appropriate type for an array of strings and JSX elements.
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(paragraph)) !== null) {
            // Push the text before the match
            if (match.index > lastIndex) {
                parts.push(paragraph.substring(lastIndex, match.index));
            }
            
            // Push the link as a JSX element
            const href = match[1];
            const text = match[2];
            parts.push(
                <a href={href} key={`${pIndex}-${match.index}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                    {text}
                </a>
            );

            lastIndex = urlRegex.lastIndex;
        }

        // Push any remaining text after the last match
        if (lastIndex < paragraph.length) {
            parts.push(paragraph.substring(lastIndex));
        }

        return <p key={pIndex} className="mb-2">{parts}</p>;
    });
  };

  const getSpoilerLevelClass = (level: number) => {
    if (level === 1) return 'border-yellow-500/50 bg-yellow-900/30';
    if (level === 2) return 'border-red-500/50 bg-red-900/30';
    return 'border-gray-600/50 bg-gray-800/30';
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spinner /></div>;
  if (error) return <div className="text-center text-red-400 p-4">{error}</div>;
  if (!vn) return <div className="text-center text-gray-400 p-4">Visual novel not found.</div>;

  const sortedTags = [...(vn.tags || [])].sort((a, b) => b.rating - a.rating);

  return (
    <>
      <div className="animate-fade-in">
        <button onClick={onBack} className="mb-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
          Back to Search
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            {vn.image && (
              <img src={vn.image.url} alt={vn.title} className="w-full h-auto object-cover rounded-lg shadow-lg" />
            )}
            <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-white">Details</h3>
                  <div className="space-y-2 text-sm">
                      <p><strong>Rating:</strong> {vn.rating ? (vn.rating / 10).toFixed(2) : 'N/A'} ({vn.votecount} votes)</p>
                      <p><strong>Length:</strong> {vn.length_minutes ? `${Math.round(vn.length_minutes / 60)} hours` : 'N/A'}</p>
                      <p><strong>Languages:</strong> {vn.languages.join(', ')}</p>
                      <p><strong>Platforms:</strong> {vn.platforms.join(', ')}</p>
                  </div>
              </div>
          </div>

          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-1 text-white">{vn.title}</h1>
            {vn.alttitle && <h2 className="text-xl text-gray-400 mb-4">{vn.alttitle}</h2>}

            <div className="prose prose-invert max-w-none bg-gray-800/50 p-6 rounded-lg break-words">
              {renderDescription(vn.description)}
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {sortedTags.map(tag => (
                  <TagBadge key={tag.id} tag={tag} className={getSpoilerLevelClass(tag.spoiler)} />
                ))}
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4 text-white">Screenshots</h3>
              {vn.screenshots && vn.screenshots.length > 0 ? (
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {vn.screenshots.map((ss, index) => (
                          <button onClick={() => setViewingImageIndex(index)} key={index} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 rounded-md block w-full aspect-video">
                            <img src={ss.thumbnail} alt={`Screenshot ${index + 1}`} className="rounded-md hover:opacity-80 transition-opacity w-full h-full object-cover" />
                          </button>
                      ))}
                  </div>
              ) : <p className="text-gray-400">No screenshots available.</p>}
            </div>

          </div>
        </div>
      </div>
      {viewingImageIndex !== null && vn?.screenshots && (
        <ImageViewer 
          screenshots={vn.screenshots}
          currentIndex={viewingImageIndex}
          onClose={() => setViewingImageIndex(null)}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </>
  );
};

export default VnDetailPage;