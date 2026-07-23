import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import MaterialModal from './components/MaterialModal';
import SettingsModal from './components/SettingsModal';
import CommandPaletteModal from './components/CommandPaletteModal';

import OverviewView from './components/OverviewView';
import AITutorChat from './components/AITutorChat';
import AISummarizer from './components/AISummarizer';
import AIQuizEngine from './components/AIQuizEngine';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import FlashcardsView from './components/FlashcardsView';
import MindMapView from './components/MindMapView';
import RoadmapView from './components/RoadmapView';

import { SAMPLE_MATERIALS } from './data/sampleMaterials';

export default function App() {
  // Load saved materials or fallback to SAMPLE_MATERIALS
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem('mindspark_materials');
    return saved ? JSON.parse(saved) : SAMPLE_MATERIALS;
  });

  const [activeMaterialId, setActiveMaterialId] = useState(() => {
    return materials[0]?.id || null;
  });

  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sidebar & Theme
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('mindspark_theme') || 'dark');

  // Quiz history
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('mindspark_quiz_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist materials
  useEffect(() => {
    localStorage.setItem('mindspark_materials', JSON.stringify(materials));
  }, [materials]);

  // Persist quiz history
  useEffect(() => {
    localStorage.setItem('mindspark_quiz_history', JSON.stringify(quizHistory));
  }, [quizHistory]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('mindspark_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Global Ctrl+K Command Palette Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeMaterial = materials.find(m => m.id === activeMaterialId) || materials[0];

  const handleSaveNewMaterial = (newMatData) => {
    const newMaterial = {
      id: `mat-${Date.now()}`,
      title: newMatData.title,
      category: newMatData.category || 'General',
      icon: newMatData.icon || 'FileText',
      difficulty: 'Intermediate',
      lastActive: 'Just now',
      mediaUrl: newMatData.mediaUrl || null,
      fileType: newMatData.fileType || 'text',
      content: newMatData.content
    };
    setMaterials(prev => [newMaterial, ...prev]);
    setActiveMaterialId(newMaterial.id);
    setActiveTab('overview');
  };

  const handleUpdateMaterial = (updatedMat) => {
    setMaterials(prev => prev.map(m => m.id === updatedMat.id ? updatedMat : m));
  };

  const handleDeleteMaterial = (matId) => {
    if (materials.length <= 1) {
      alert('You must keep at least one study material in your notebook workspace.');
      return;
    }
    const updated = materials.filter(m => m.id !== matId);
    setMaterials(updated);
    if (activeMaterialId === matId) {
      setActiveMaterialId(updated[0].id);
    }
  };

  const handleQuizCompleted = (record) => {
    setQuizHistory(prev => [record, ...prev]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app-container">
      {/* Notion Sidebar Navigation */}
      <Sidebar
        materials={materials}
        activeMaterialId={activeMaterialId}
        onSelectMaterial={(id) => setActiveMaterialId(id)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onDeleteMaterial={handleDeleteMaterial}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(prev => !prev)}
      />

      {/* Main Workspace Area */}
      <main className="main-area">
        <TopBar
          activeMaterial={activeMaterial}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Tab Viewport Content */}
        {activeTab === 'overview' && (
          <OverviewView
            material={activeMaterial}
            onUpdateMaterial={handleUpdateMaterial}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'tutor' && (
          <AITutorChat material={activeMaterial} />
        )}

        {activeTab === 'summary' && (
          <AISummarizer material={activeMaterial} />
        )}

        {activeTab === 'quiz' && (
          <AIQuizEngine material={activeMaterial} onQuizCompleted={handleQuizCompleted} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard materials={materials} quizHistory={quizHistory} />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView material={activeMaterial} />
        )}

        {activeTab === 'mindmap' && (
          <MindMapView material={activeMaterial} />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView material={activeMaterial} quizHistory={quizHistory} />
        )}
      </main>

      {/* Modals */}
      {isAddModalOpen && (
        <MaterialModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNewMaterial}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          onUpdate={() => {}}
        />
      )}

      {isCommandPaletteOpen && (
        <CommandPaletteModal
          onClose={() => setIsCommandPaletteOpen(false)}
          materials={materials}
          onSelectMaterial={(id) => {
            setActiveMaterialId(id);
            setActiveTab('overview');
          }}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />
      )}
    </div>
  );
}
