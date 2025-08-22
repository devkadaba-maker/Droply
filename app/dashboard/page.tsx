"use client";

import { useState, useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import {
  Plus, Folder, File, Star, Trash2, Home, Clock, Search, MoreVertical
} from 'lucide-react';
// NEW: Import Modal components and our FileUpload component
import { Modal, ModalContent, ModalHeader, ModalBody, Button } from '@nextui-org/react';
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

  // NEW: Add state management for the modal window - temporarily using useState instead of useDisclosure
  const [isOpen, setIsOpen] = useState(false);

  // Add useEffect to log state changes
  useEffect(() => {
    console.log('🔄 Modal state changed - isOpen:', isOpen);
  }, [isOpen]);

  // --- Data-fetching and action functions (no changes) ---
  useEffect(() => { if (userId) fetchFiles(); }, [userId, currentFolder, activeView]);
  
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
        <Button
          onPress={() => {
            console.log('New button clicked, opening modal');
            setIsOpen(true);
          }}
          className="flex items-center justify-center gap-3 bg-white w-32 h-14 rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-shadow mb-6"
          startContent={<Plus size={24} />}
        >
          New
        </Button>
        
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
        
        <h2 className="text-2xl text-slate-800 mb-4 capitalize">{activeView === 'bin' ? 'Bin' : activeView}</h2>

        <div className="w-full">
          {/* ... File list is unchanged ... */}
        </div>

        {/* TEST: Simple div modal first */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-blue-800">Simple Modal Test</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-green-600">🎉 Modal is working!</p>
                <p className="text-sm text-gray-600">This is a simple div modal to test basic functionality.</p>

                <button
                  onClick={() => alert('Button works!')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Test Button - Click me!
                </button>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 mt-4">
                  <p className="text-sm text-gray-500">File upload area would go here</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}