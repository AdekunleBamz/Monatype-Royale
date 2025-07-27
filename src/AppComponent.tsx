// src/AppComponent.tsx
import React from 'react';
import './App.css';
import { Lobby } from './components/Lobby';

const AppComponent: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Monatype</h1>
      </header>
      <main className="app-main">
        <Lobby />
      </main>
      <footer className="app-footer">
        {/* Add footer content if needed */}
      </footer>
    </div>
  );
};

export default AppComponent;
