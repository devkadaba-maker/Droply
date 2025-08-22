"use client";

import { useState, useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import {
  Plus, Folder, File, Star, Trash2, Home, Clock, Search, MoreVertical
} from 'lucide-react';
// NEW: Import Modal components and our FileUpload component
import { Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from '@heroui/modal';
import FileUpload from '@/components/FileUpload';

// --- Interfaces and NavLink component remain the same ---
interface FileData {
  id: string;
  name: string;
  isFolder: boolean;
  isStarred: boolean;
  isTrash: boolean;
  fileUrl: string;
  updatedAt: string;
}

const NavLink = ({ icon, label, isActive = false }: { icon: React.ReactNode; label: string; isActive?: boolean }) => (
  <a
    href="#"
    className={`flex items-center gap-4 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-slate-700 hover:bg-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </a>
);

// --- Main Dashboard Component ---
export default function DashboardPage() {
  const { userId } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('home');

  // NEW: Add state management for the modal window
  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();

  // --- Data-fetching and action functions (no changes) ---
  useEffect(() => { if (userId) fetchFiles(); }, [userId, currentFolder, activeView]);
  // const fetchFiles = async () => { /* ... Function remains the same ... */ };
  // const handleFileClick = (file: FileData) => { /* ... Function remains the same ... */ };
  // const handleNavClick = (view: string) => { /* ... Function remains the same ... */ };
  
  // (Functions included for completeness)
  const fetchFiles = async () => {
    if (!userId) return;
    let url = `/api/files?userId=${userId}`;
    if (activeView === 'starred') { url += '&isStarred=true'; }
    else if (activeView === 'bin') { url += '&isTrash=true'; }
    else { if (currentFolder) { url += `&parentId=${currentFolder}`; } }
    const response = await fetch(url);
    if (response.ok) { const data = await response.json(); setFiles(data.files || []); }
  };
  const handleFileClick = (file: FileData) => {
    if (activeView === 'home' && file.isFolder) { setCurrentFolder(file.id); }
    else { window.open(file.fileUrl, '_blank'); }
  };
  const handleNavClick = (view: string) => {
      setActiveView(view);
      setCurrentFolder(null);
  };

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen font-sans text-[#3c4043]">
      {/* --- Sidebar Navigation --- */}
      <aside className="bg-[#f8f9fa] w-64 p-4 flex flex-col h-screen fixed top-0 left-0">
        <div className="flex items-center gap-2 mb-6 px-2">
          <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <span className="text-2xl font-bold text-slate-700">Droply</span>
        </div>
        
        {/* MODIFIED: The onClick handler now opens the modal */}
        <button 
          onClick={onOpen}
          className="flex items-center justify-center gap-3 bg-white w-32 h-14 rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-shadow mb-6"
        >
          <Plus size={24} />
          <span className="text-base font-medium">New</span>
        </button>
        
        <nav className="flex flex-col gap-1">
          <div onClick={() => handleNavClick('home')}><NavLink icon={<Home size={20} />} label="Home" isActive={activeView === 'home'} /></div>
          <div onClick={() => handleNavClick('starred')}><NavLink icon={<Star size={20} />} label="Starred" isActive={activeView === 'starred'} /></div>
          <div onClick={() => handleNavClick('recent')}><NavLink icon={<Clock size={20} />} label="Recent" isActive={activeView === 'recent'} /></div>
          <div onClick={() => handleNavClick('bin')}><NavLink icon={<Trash2 size={20} />} label="Bin" isActive={activeView === 'bin'} /></div>
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="ml-64 p-6 w-full">
        <header className="flex justify-between items-center w-full mb-8">
          {/* ... Header content is unchanged ... */}
        </header>
        
        <h2 className="text-2xl text-slate-800 mb-4 capitalize">{activeView === 'bin' ? 'Bin' : activeView}</h2>

        <div className="w-full">
          {/* ... File list is unchanged ... */}
        </div>

        {/* NEW: Add the Modal with the FileUpload component */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">Upload a File</ModalHeader>
            <ModalBody>
              <FileUpload
                parentId={currentFolder}
                onUploadComplete={() => {
                  fetchFiles(); // This refreshes the file list
                  setTimeout(() => onClose(), 1500); // Closes the modal after a success message
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </main>
    </div>
  );
}