import React from 'react';
import EditorModule from 'react-simple-code-editor'; 
import { highlight, languages } from 'prismjs/components/prism-core';

// --- CORRECCIÓN CRÍTICA ---
// 'clike' debe importarse PRIMERO porque es la dependencia base para Java y Scala.
import 'prismjs/components/prism-clike'; 

// Luego importamos los lenguajes que lo necesitan
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-scala';

// Y el resto de lenguajes
import 'prismjs/components/prism-python'; 
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-r';

import 'prismjs/themes/prism-tomorrow.css';

const Editor = EditorModule.default || EditorModule;

// Mapa de etiquetas amigables
const LANGUAGE_LABELS = {
  python: 'Python',
  java: 'Java',
  scala: 'Scala',
  r: 'R Stats',
  sql: 'SQL'
};

export default function CodeEditor({ code, onChange, language = 'python', readOnly = false }) {
  return (
    <div className="relative font-mono text-sm group h-full flex flex-col">
      {/* Header del Editor Dinámico */}
      <div className="w-full h-8 bg-[var(--bg-main)]/50 border-b border-[var(--border)] flex items-center px-3 text-xs opacity-50 z-10 rounded-t-lg select-none uppercase tracking-wider font-bold">
        {LANGUAGE_LABELS[language] || language}
      </div>
      
      <div className="flex-grow relative bg-[var(--bg-card)] overflow-y-auto custom-scrollbar rounded-b-lg">
        <Editor
          value={code}
          onValueChange={(code) => onChange && onChange(code)}
          highlight={(code) => {
            // Fallback robusto: Si languages[language] falla, usa python, si falla, clike. Evita crash.
            const grammar = languages[language] || languages.python || languages.clike;
            // Doble check por si grammar sigue siendo null/undefined (ej: al cargar muy rápido)
            return highlight(code, grammar || languages.python); 
          }}
          padding={16}
          readOnly={readOnly}
          className="font-mono min-h-full"
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 14,
            backgroundColor: 'transparent', 
            color: 'inherit', 
          }}
          textareaClassName="focus:outline-none"
        />
      </div>
      
      <style>{`
        code[class*="language-"], pre[class*="language-"] {
          text-shadow: none !important;
        }
        .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}