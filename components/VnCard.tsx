
import React, { memo } from 'react';
import { VisualNovel } from '../types';

interface VnCardProps {
  vn: VisualNovel;
  onVnSelect: (id: string) => void;
}

const VnCard: React.FC<VnCardProps> = ({ vn, onVnSelect }) => {
  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer transform hover:scale-105 transition-transform duration-300 group"
      onClick={() => onVnSelect(vn.id)}
    >
      <div className="relative aspect-[3/4]">
        <img
          src={vn.image?.url || `https://picsum.photos/seed/${vn.id}/300/400`}
          alt={vn.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-2 text-white">
          <h3 className="font-bold text-sm leading-tight group-hover:text-indigo-300 transition-colors">{vn.title}</h3>
        </div>
      </div>
      <div className="p-2 bg-gray-800 text-xs text-gray-400 flex justify-between items-center">
        <span>⭐ {vn.rating ? (vn.rating / 10).toFixed(2) : 'N/A'}</span>
        <span>👥 {vn.votecount}</span>
      </div>
    </div>
  );
};

export default memo(VnCard);
