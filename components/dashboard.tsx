"use client";

import { useState, useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import {
  Plus,
  Folder,
  File,
  Star,
  Trash2,
  Home,
  Clock,
  Search,
  MoreVertical,
  Download,
  Pencil,
  Loader2,
} from 'lucide-react';
import NewItemModal from './NewItemModal';
import FileUploadArea from './FileUploadArea';

// Define the shape of our file data
interface FileData {
  id: string;
  name: string;
  isFolder: boolean;
  isStarred: boolean;
  isTrash: boolean;
  fileUrl: string;
  updatedAt: string;
}

// A reusable, styled navigation link component
const NavLink = ({ icon, label, isActive = false }: { icon: React.ReactNode; label: string; isActive?: boolean }) => (
    <a href="#" className={`flex items-center gap-4 px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-700 hover:bg-slate-200'}`}>{icon}<span>{label}</span></a>
);

// A dedicated component for the spinner to keep the main component clean
const FullScreenLoader = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-[#f8f9fa]">
    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
  </div>
);


export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'starred' | 'trash'>('home');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isUploadAreaOpen, setIsUploadAreaOpen] = useState(false);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  
  // This state is now only for the data fetching, not for the initial auth load.
  const [isFetchingData, setIsFetchingData] = useState(true);

  useEffect(() => {
    // We only ever try to fetch files if we have a confirmed user.
    if (userId) {
      fetchFiles();
    }
  }, [userId, currentFolder, view]);

  const fetchFiles = async () => {
    if (!userId) return;
    setIsFetchingData(true);
    try {
      let queryParams = `userId=${userId}`;
      if (view === 'home' && currentFolder) queryParams += `&parentId=${currentFolder}`;
      if (view === 'starred') queryParams += '&isStarred=true';
      if (view === 'trash') queryParams += '&isTrash=true';
      const response = await fetch(`/api/files?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to fetch files:", error);
    } finally {
      setIsFetchingData(false);
    }
  };
  
  // --- All other handler functions (handleFileClick, handleRename, etc.) ---
  // These are unchanged and will work correctly.
  const handleFileClick = (file: FileData) => { if (file.isFolder && view === 'home') { setCurrentFolder(file.id); } else if (!file.isFolder) { window.open(file.fileUrl, '_blank'); } };
  const handleNavigation = (newView: 'home' | 'starred' | 'trash') => { setView(newView); setCurrentFolder(null); };
  const handleRename = async (fileId: string) => { if (!newName.trim()) { setRenamingFileId(null); return; } try { const response = await fetch(`/api/files/${fileId}/rename`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName }), }); if (response.ok) { fetchFiles(); } } catch (error) { console.error('Error renaming file:', error); } finally { setRenamingFileId(null); setNewName(''); } };
  const toggleStar = async (fileId: string, isCurrentlyStarred: boolean) => { await fetch(`/api/files/${fileId}/star`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isStarred: !isCurrentlyStarred }) }); fetchFiles(); };
  const toggleTrash = async (fileId: string, isCurrentlyTrashed: boolean) => { await fetch(`/api/files/${fileId}/trash`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isTrash: !isCurrentlyTrashed }) }); fetchFiles(); };
  const deleteFile = async (fileId: string) => { if (confirm('Are you sure you want to permanently delete this file?')) { await fetch(`/api/files/${fileId}/delete`, { method: 'DELETE' }); fetchFiles(); } };
  const createFolder = async (name: string) => { await fetch('/api/folders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), parentId: currentFolder, userId: userId }) }); fetchFiles(); };
  const handleUploadFiles = async (filesToUpload: FileList) => { for (let i = 0; i < filesToUpload.length; i++) { const formData = new FormData(); formData.append('file', filesToUpload[i]); if (currentFolder) formData.append('parentId', currentFolder); await fetch('/api/files/upload', { method: 'POST', body: formData }); } fetchFiles(); };
  const handleDownload = async (fileId: string, fileName: string) => { const response = await fetch(`/api/files/${fileId}/download`); if (response.ok) { const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.setAttribute("download", fileName); document.body.appendChild(link); link.click(); link.parentNode?.removeChild(link); window.URL.revokeObjectURL(url); } };

  // --- RIGID LOADING STATE LOGIC ---

  // 1. First, wait for Clerk to be ready. This is the most important check.
  if (!isLoaded) {
    return <FullScreenLoader />;
  }

  // 2. If Clerk is ready but there is no user, they are logged out.
  // Show the spinner while the middleware redirects them to the sign-in page.
  if (!userId) {
    return <FullScreenLoader />;
  }
  
  // 3. If we are here, we have a user. Now, we can render the dashboard.
  return (
    <div className="flex bg-[#f8f9fa] min-h-screen font-sans text-[#3c4043]">
      <aside className="bg-[#f8f9fa] w-64 p-4 flex flex-col h-screen fixed top-0 left-0">
        <div className="flex items-center gap-2 mb-6 px-2">
          <svg className="h-8 w-8 text-blue-600" viewBox="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <span className="text-2xl font-bold text-slate-700">Droply</span>
        </div>
        
        <button
          onClick={() => setIsNewItemModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-white w-32 h-14 rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-shadow mb-6"
        >
          <Plus size={24} />
          <span className="text-base font-medium">New</span>
        </button>
        
        <nav className="flex flex-col gap-1">
          <div onClick={() => handleNavigation('home')}>
            <NavLink icon={<Home size={20} />} label="Home" isActive={view === 'home'} />
          </div>
          <div onClick={() => handleNavigation('starred')}>
            <NavLink icon={<Star size={20} />} label="Starred" isActive={view === 'starred'} />
          </div>
          <div onClick={() => handleNavigation('trash')}>
            <NavLink icon={<Trash2 size={20} />} label="Bin" isActive={view === 'trash'} />
          </div>
        </nav>
      </aside>

      <main className="ml-64 p-6 w-full">
        <header className="flex justify-between items-center w-full mb-8">
            <div className="relative flex-grow max-w-[720px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search in Drive"
                  className="w-full h-12 bg-[#e8eaed] rounded-full pl-14 pr-4 text-base placeholder:text-slate-500 focus:bg-white focus:shadow-[0_1px_1px_0_rgba(0,0,0,.1),0_2px_6px_2px_rgba(0,0,0,.08)] focus:outline-none transition-all"
                />
            </div>
            <div className="flex items-center gap-4">
              <UserButton afterSignOutUrl="/" />
            </div>
        </header>
        
        {/* Conditional rendering for the file list based on data fetching state */}
        {isFetchingData ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {view === 'home' && currentFolder && (
              <div className="flex items-center gap-2 mb-4 text-sm text-slate-600">
                <button
                  onClick={() => setCurrentFolder(null)}
                  className="hover:text-blue-600 font-medium"
                >
                  My Drive
                </button>
                <span>/</span>
                <span className="font-medium">Current Folder</span>
              </div>
            )}

            <h2 className="text-2xl text-slate-800 mb-4">
              {view === 'home' && !currentFolder && 'My Drive'}
              {view === 'home' && currentFolder && 'Current Folder'}
              {view === 'starred' && 'Starred'}
              {view === 'trash' && 'Trash'}
            </h2>

            <div className="w-full">
              <div className="grid grid-cols-[minmax(0,4fr)_1fr_2fr_1fr_120px] gap-4 px-4 py-2 border-b border-slate-200 text-sm font-medium text-slate-500">
                <span>Name</span>
                <span>Owner</span>
                <span>Last Modified</span>
                <span>File size</span>
                <span className="text-center">Actions</span>
              </div>

              {files.map((file) => (
                <div
                  key={file.id}
                  className="grid grid-cols-[minmax(0,4fr)_1fr_2fr_1fr_120px] gap-4 items-center h-12 px-4 border-b border-slate-200 hover:bg-blue-50 rounded-lg group"
                >
                  <div
                    className="flex items-center gap-4 truncate cursor-pointer"
                    onClick={() => renamingFileId !== file.id && handleFileClick(file)}
                  >
                    {file.isFolder ? <Folder size={24} className="text-slate-500" /> : <File size={24} className="text-slate-500" />}
                    {renamingFileId === file.id ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={() => handleRename(file.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(file.id);
                          if (e.key === 'Escape') setRenamingFileId(null);
                        }}
                        className="font-medium truncate bg-white border border-blue-400 rounded px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium truncate">{file.name}</span>
                    )}
                  </div>
                  <div className="text-sm">me</div>
                  <div className="text-sm">{new Date(file.updatedAt).toLocaleDateString()}</div>
                  <div className="text-sm">--</div>
                  <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {view !== 'trash' && (
                      <button onClick={(e) => { e.stopPropagation(); setRenamingFileId(file.id); setNewName(file.name); }} className="p-1 rounded hover:bg-slate-200 text-slate-500" title="Rename"><Pencil size={16} /></button>
                    )}
                    {!file.isFolder && view !== 'trash' && (
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(file.id, file.name); }} className="p-1 rounded hover:bg-slate-200 text-slate-500" title="Download file"><Download size={16} /></button>
                    )}
                    {view !== 'trash' && (
                      <button onClick={(e) => { e.stopPropagation(); toggleStar(file.id, file.isStarred); }} className={`p-1 rounded hover:bg-slate-200 ${file.isStarred ? 'text-yellow-500' : 'text-slate-500'}`} title={file.isStarred ? 'Remove from starred' : 'Add to starred'}><Star size={16} fill={file.isStarred ? 'currentColor' : 'none'} /></button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); if (view === 'trash') { toggleTrash(file.id, true); } else { toggleTrash(file.id, false); } }} className="p-1 rounded hover:bg-slate-200 text-slate-500" title={view === 'trash' ? 'Restore file' : 'Move to trash'}>{view === 'trash' ? <Folder size={16} /> : <Trash2 size={16} />}</button>
                    {view === 'trash' && (
                      <button onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }} className="p-1 rounded hover:bg-red-100 text-red-500" title="Permanently delete"><Trash2 size={16} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <NewItemModal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
        onCreateFolder={createFolder}
        onUploadFiles={handleUploadFiles}
      />

      <FileUploadArea
        isOpen={isUploadAreaOpen}
        onClose={() => setIsUploadAreaOpen(false)}
        onUploadComplete={fetchFiles}
        parentId={currentFolder}
      />
    </div>
  );
}