
import React from 'react';
import { PhotoLog, User } from '../types';
import { 
  Camera, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  MapPin, 
  Calendar, 
  Tag, 
  Download, 
  Share2, 
  Maximize2,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';

interface PhotoLogsProps {
  photoLogs: PhotoLog[];
  users: User[];
}

const PhotoLogs: React.FC<PhotoLogsProps> = ({ photoLogs, users }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedPhoto, setSelectedPhoto] = React.useState<PhotoLog | null>(null);

  const filteredPhotos = photoLogs.filter(p => 
    p.caption.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getUploaderName = (uid: string) => {
    return users.find(u => u.uid === uid)?.name || 'Unknown User';
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search photos, locations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
            />
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <Filter className="w-5 h-5" />
          </button>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <Plus className="w-4 h-4" />
          Upload Photos
        </button>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPhotos.map(photo => (
          <div key={photo.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-300 transition-all group">
            <div className="relative aspect-square overflow-hidden bg-slate-100">
              <img 
                src={photo.url} 
                alt={photo.caption} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
                <button 
                  onClick={() => setSelectedPhoto(photo)}
                  className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40 transition-all"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40 transition-all">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/20 backdrop-blur-md text-white rounded-lg hover:bg-white/40 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h4 className="font-bold text-slate-800 text-sm mb-2 line-clamp-1">{photo.caption}</h4>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <MapPin className="w-3 h-3" />
                  {photo.location}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                  <Calendar className="w-3 h-3" />
                  {new Date(photo.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {photo.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded-full border border-slate-200">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3 h-3 text-slate-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{getUploaderName(photo.uploadedBy)}</span>
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-all">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={selectedPhoto.url} 
              alt={selectedPhoto.caption} 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition-all"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
              <h3 className="text-xl font-bold mb-2">{selectedPhoto.caption}</h3>
              <p className="text-sm text-slate-300">{selectedPhoto.location} • {new Date(selectedPhoto.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoLogs;
