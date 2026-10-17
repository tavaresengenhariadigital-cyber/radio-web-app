/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RadioProvider, useRadio } from './context/RadioContext';
import { LivePlayer } from './components/LivePlayer';
import { BroadcasterStudio } from './components/BroadcasterStudio';
import { AuthModal } from './components/AuthModal';

const AppContent: React.FC = () => {
  const { activeTab } = useRadio();

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      <main className="flex-1 flex flex-col">
        {activeTab === 'listener' && <LivePlayer />}
        {activeTab === 'studio' && <BroadcasterStudio />}
      </main>

      {/* Global Auth Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <RadioProvider>
      <AppContent />
    </RadioProvider>
  );
}
