import { useState, useEffect } from 'react';
import { getPageAgent, initializePageAgent } from '../services/pageAgent';

export function AIAgentButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  useEffect(() => {
    // Initialize page-agent on mount
    const agent = initializePageAgent();

    // Listen to status changes to sync panel state
    const handleStatusChange = () => {
      // Panel visibility tracking can be synced here if needed
    };

    agent.addEventListener('statuschange', handleStatusChange);

    return () => {
      agent.removeEventListener('statuschange', handleStatusChange);
    };
  }, []);

  const handleClick = () => {
    const agent = getPageAgent();
    if (!agent) return;

    if (isPanelOpen) {
      agent.panel.hide();
      setIsPanelOpen(false);
    } else {
      agent.panel.show();
      setIsPanelOpen(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-3 left-3 z-9999 flex items-center gap-1 px-2 py-1 rounded border border-border bg-black/80 backdrop-blur-sm hover:border-accent/50 transition-all"
      aria-label="Toggle Page Agent"
    >
      <span
        className="text-[10px] font-medium"
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Page-Agent
      </span>
      {isPanelOpen && (
        <span className="w-1 h-1 rounded-full bg-accent animate-pulse"></span>
      )}
    </button>
  );
}
