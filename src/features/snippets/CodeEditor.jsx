import { useEffect, useRef, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import { Loader } from 'lucide-react';

export default function CodeEditor({ code, onChange, language = 'python', readOnly = false }) {
  const { isDark } = useTheme();
  const monaco = useMonaco();
  
  // Estado local para el valor inmediato del editor
  // Esto desacopla la escritura rápida del renderizado de React
  const [localValue, setLocalValue] = useState(code);

  // Actualizar valor local si cambia el prop code externamente (ej: al cargar un snippet)
  useEffect(() => {
    if (code !== localValue) {
      setLocalValue(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Mapeo de lenguajes para Monaco Editor
  const languageMap = {
    python: 'python',
    javascript: 'javascript',
    java: 'java',
    sql: 'sql',
    r: 'r',
    scala: 'scala',
    html: 'html',
    css: 'css',
    json: 'json',
    dax: 'msdax', 
    m: 'powerquery', 
    powerfx: 'vb', 
    excel: 'vb' 
  };

  const mappedLanguage = languageMap[language] || 'plaintext';

  // Debounce manual usando useRef para no perder la referencia del timer
  const debounceRef = useRef(null);

  const handleEditorChange = (value) => {
    setLocalValue(value); // Actualización visual inmediata

    if (onChange) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      // Esperar 300ms antes de avisar al componente padre
      // Esto evita re-renderizar todo el Dashboard con cada tecla
      debounceRef.current = setTimeout(() => {
        onChange(value);
      }, 300);
    }
  };

  // Definición de temas
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('vault-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#1A1D1D',
          'editor.lineHighlightBackground': '#2A2D2D',
        }
      });

      monaco.editor.defineTheme('vault-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#FFFFFF',
          'editor.lineHighlightBackground': '#F0F0F0',
        }
      });
    }
  }, [monaco]);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] flex flex-col relative">
      {/* Header */}
      <div className="h-8 bg-[var(--bg-main)] border-b border-[var(--border)] flex items-center px-4 justify-between select-none shrink-0">
        <span className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${readOnly ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`} />
           {mappedLanguage}
        </span>
        {readOnly && <span className="text-[10px] bg-[var(--border)] px-2 py-0.5 rounded text-[var(--text-secondary)]">Lectura</span>}
      </div>
      
      {/* Editor Container */}
      <div className="flex-grow relative">
        <Editor
          height="100%"
          language={mappedLanguage}
          value={localValue}
          theme={isDark ? 'vault-dark' : 'vault-light'}
          onChange={handleEditorChange}
          loading={
            <div className="flex items-center justify-center h-full text-[var(--accent)]">
              <Loader className="animate-spin" size={24} />
            </div>
          }
          options={{
            readOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true, // Nota: Esto consume recursos, pero es necesario para responsive
            fontFamily: '"JetBrains Mono", monospace',
            padding: { top: 16, bottom: 16 },
            tabSize: 2,
            renderWhitespace: 'selection',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on'
          }}
        />
      </div>
    </div>
  );
}