"use client";

import { useState, useEffect } from 'react';
import { useAuth, UserButton } from '@clerk/nextjs';
import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Input } from '@heroui/input';
import {
  Plus, Folder, File, Star, Trash2, MoreVertical, UploadCloud, Home, Clock
} from 'lucide-react';

// Import our new CSS Module
import styles from './Dashboard.module.css';

interface FileData {
  id: string;
  name: string;
  isFolder: boolean;
  isStarred: boolean;
  isTrash: boolean;
  fileUrl: string;
}

const NavLink = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <a href="#" className={styles.navLink}>
    {icon}
    <span>{label}</span>
  </a>
);

export default function DashboardPage() {
  const { userId } = useAuth();
  const [files, setFiles] = useState<FileData[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');

  // All your data-fetching and action functions remain the same
  useEffect(() => {
    if (userId) fetchFiles();
  }, [userId, currentFolder]);
  const fetchFiles = async () => { if (!userId) return; const parentIdQuery = currentFolder ? `&parentId=${currentFolder}` : ''; const response = await fetch(`/api/files?userId=${userId}${parentIdQuery}`); if (response.ok) { const data = await response.json(); setFiles(data.files || []); }};
  const createFolder = async () => { if (!newFolderName.trim() || !userId) return; const response = await fetch('/api/folders/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newFolderName, userId, parentId: currentFolder }), }); if (response.ok) { setNewFolderName(''); fetchFiles(); }};
  const handleFileClick = (file: FileData) => { if (file.isFolder) { setCurrentFolder(file.id); } else { window.open(file.fileUrl, '_blank'); }};
  const toggleFileProperty = async (fileId: string, property: 'star' | 'trash') => { const response = await fetch(`/api/files/${fileId}/${property}`, { method: 'PATCH' }); if (response.ok) { fetchFiles(); }};

  


  return (
    
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <h1>Droply</h1>
        <nav>
          <NavLink icon={<Home size={20} />} label="Home" />
          <NavLink icon={<Clock size={20} />} label="Recents" />
          <NavLink icon={<Star size={20} />} label="Starred" />
          <NavLink icon={<Trash2 size={20} />} label="Trash" />
        </nav>
        <div className={styles.uploadButton}>
          <Button>
            <UploadCloud size={20} />
            Upload File
          </Button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h2>My Files</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        {files.length === 0 && (
          <p className = "text-gray-400">No files found</p>
        )}
        <div className={styles.fileGrid}>
          {files.map((file) => (
            <Card key={file.id} isPressable onPress={() => handleFileClick(file)}>
              <CardHeader>
                {file.isFolder ? <Folder size={40} color="#3b82f6" /> : <File size={40} color="#64748b" />}
              </CardHeader>
              <CardBody>
                <p style={{ fontWeight: 500 }}>{file.name}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={(e) => { e.stopPropagation(); toggleFileProperty(file.id, 'star'); }}>
                    <Star size={18} color={file.isStarred ? '#facc15' : '#cbd5e1'} fill={file.isStarred ? '#facc15' : 'none'} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleFileProperty(file.id, 'trash'); }}>
                    <Trash2 size={18} color="#cbd5e1" />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}