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
} from 'lucide-react';

// Define the shape of our file data
interface FileData {
  id: string;
  name: string;
  isFolder: boolean;
  isStarred: boolean;
  isTrash: boolean;
  fileUrl: string;
  updatedAt: string; // Assuming 'updatedAt' is available from your API
}

// A reusable, styled navigation link component for the sidebar
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

// Main Dashboard Component
export default function DashboardPage() {
  const { userId } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  // Data-fetching and action functions remain the same
  useEffect(() => { if (userId) fetchFiles(); }, [userId, currentFolder]);
  const fetchFiles = async () => { if (!userId) return; const parentIdQuery = currentFolder ? `&parentId=${currentFolder}` : ''; const response = await fetch(`/api/files?userId=${userId}${parentIdQuery}`); if (response.ok) { const data = await response.json(); setFiles(data.files || []); }};
  const handleFileClick = (file: FileData) => { if (file.isFolder) { setCurrentFolder(file.id); } else { window.open(file.fileUrl, '_blank'); }};

  return (
    <div className="flex bg-[#f8f9fa] min-h-screen font-sans text-[#3c4043]">
      {/* Sidebar Navigation */}
      <aside className="bg-[#f8f9fa] w-64 p-4 flex flex-col h-screen fixed top-0 left-0">
        <div className="flex items-center gap-2 mb-6 px-2">
          {/* A simple logo */}
          <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          <span className="text-2xl font-bold text-slate-700">Droply</span>
        </div>
        
        <button className="flex items-center justify-center gap-3 bg-white w-32 h-14 rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] hover:shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)] transition-shadow mb-6">
          <Plus size={24} />
          <span className="text-base font-medium">New</span>
        </button>
        
        <nav className="flex flex-col gap-1">
          <NavLink icon={<Home size={20} />} label="Home" isActive={true} />
          <NavLink icon={<Star size={20} />} label="Starred" />
          <NavLink icon={<Clock size={20} />} label="Recent" />
          <NavLink icon={<Trash2 size={20} />} label="Bin" />
        </nav>
      </aside>

      {/* Main Content Area */}
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
        
        <h2 className="text-2xl text-slate-800 mb-4">My Drive</h2>

        {/* File List View */}
        <div className="w-full">
          {/* List Header */}
          <div className="grid grid-cols-[minmax(0,4fr)_1fr_2fr_1fr_48px] gap-4 px-4 py-2 border-b border-slate-200 text-sm font-medium text-slate-500">
            <span>Name</span>
            <span>Owner</span>
            <span>Last Modified</span>
            <span>File size</span>
            <span className="w-[48px]"></span> {/* Spacer for actions */}
          </div>

          {/* List Items */}
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file)}
              className="grid grid-cols-[minmax(0,4fr)_1fr_2fr_1fr_48px] gap-4 items-center h-12 px-4 border-b border-slate-200 hover:bg-blue-50 rounded-lg cursor-pointer group"
            >
              <div className="flex items-center gap-4 truncate">
                {file.isFolder ? <Folder size={24} className="text-slate-500" /> : <File size={24} className="text-slate-500" />}
                <span className="font-medium truncate">{file.name}</span>
              </div>
              <div className="text-sm">me</div>
              <div className="text-sm">{new Date(file.updatedAt).toLocaleDateString()}</div>
              <div className="text-sm">--</div>
              <div className="flex justify-center opacity-0 group-hover:opacity-100">
                <MoreVertical size={20} className="text-slate-500" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}