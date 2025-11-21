import React from 'react';

export default function CodeEditor({ code, onChange, readOnly = false }) {
  return (
    <div className="relative font-mono text-sm group h-full">
      <div className="absolute top-0 left-0 w-full h-8 bg-[var(--bg-main)]/50 border-b border-[var(--border)] flex items-center px-3 text-xs opacity-50 z-10 rounded-t-lg">
        Python
      </div>
      <textarea
        value={code}
        onChange={(e) => onChange && onChange(e.target.value)}
        readOnly={readOnly}
        className={`w-full h-full min-h-[200px] pt-10 bg-[var(--bg-card)] text-[var(--text-primary)] p-4 focus:outline-none resize-none font-mono leading-relaxed rounded-lg ${readOnly ? 'opacity-90' : ''}`}
        spellCheck="false"
        style={{ whiteSpace: 'pre' }}
      />
    </div>
  );
}