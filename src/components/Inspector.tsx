import React, { useState, useEffect, useRef } from 'react';
import { 
  Crosshair, X, Copy, Undo, Redo, Eye, 
  Type, Layout, Box, Code, FileCode, 
  ChevronDown, Plus, GripHorizontal, Settings
} from 'lucide-react';
import { generateTailwindClass, fullConfig } from '../utils/tailwindGenerator';
import { allTailwindClasses } from './ClassCatalogue';
import  LoadTailwindCDN  from './LoadCdnTailwind';
import Fuse from 'fuse.js';


interface InspectorState {
  isInspecting: boolean;
  selectedElement: HTMLElement | null;
  history: string[];
  historyIndex: number;
  activeTab: 'design' | 'code' | 'html' | 'settings';
  useCDN: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface TailwindConfig {
  theme?: {
    extend?: {
      colors?: Record<string, string>;
      [key: string]: any;
    };
  };
}




// Crear un índice de búsqueda difusa con Fuse.js
const fuse = new Fuse(allTailwindClasses, {
  threshold: 0.3,
});


export function Inspector() {
  const [state, setState] = useState<InspectorState>({
    isInspecting: false,
    selectedElement: null,
    history: [],
    historyIndex: -1,
    activeTab: 'design',
    useCDN: true
  });
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState('');
  const [position, setPosition] = useState<Position>({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [config, setConfig] = useState<string>('{\n  theme: {\n    extend: {\n      colors: {\n        clifford: "#da373d"\n      }\n    }\n  }\n}');
  const inspectorRef = useRef<HTMLDivElement>(null);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const cdnScriptRef = useRef<HTMLScriptElement | null>(null);
  const configScriptRef = useRef<HTMLScriptElement | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClasses, setFilteredClasses] = useState<string[]>([]);
  // Initialize Tailwind CDN and config
  useEffect(() => {
    if (state.useCDN) {
 
      if (!configScriptRef.current) {
        
      }
    } else {
      // Remove CDN and config if not using CDN
      cdnScriptRef.current?.remove();
      cdnScriptRef.current = null;
      configScriptRef.current?.remove();
      configScriptRef.current = null;
    }

    return () => {
      cdnScriptRef.current?.remove();
      configScriptRef.current?.remove();
    };
  }, [state.useCDN, config]);

  // Initialize style tag for arbitrary classes
  useEffect(() => {
    if (!styleTagRef.current && !state.useCDN) {
      const styleTag = document.createElement('style');
      styleTag.id = 'tailwind-inspector-styles';
      document.head.appendChild(styleTag);
      styleTagRef.current = styleTag;
    }

    return () => {
      if (styleTagRef.current) {
        styleTagRef.current.remove();
      }
    };
  }, [state.useCDN]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClasses([]);
      setHighlightedIndex(-1);
      return;
    }

    const results = fuse.search(searchTerm);
    setFilteredClasses(results.slice(0, 20).map((r) => r.item));
    setHighlightedIndex(0);
  }, [searchTerm]);



  // Update Tailwind config when changed
  const updateConfig = (newConfig: string) => {
    try {
      // Validate JSON
      JSON.parse(newConfig);
      setConfig(newConfig);
      
      if (state.useCDN && configScriptRef.current) {
        configScriptRef.current.textContent = `
          tailwind.config = ${newConfig}
        `;
      }
    } catch (e) {
      console.error('Invalid JSON configuration');
    }
  };

  // Toggle CDN usage
  const toggleCDN = () => {
    setState(prev => ({ ...prev, useCDN: !prev.useCDN }));
  };

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!inspectorRef.current) return;
    
    setIsDragging(true);
    const rect = inspectorRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Toggle inspection mode
  const toggleInspector = () => {
    setState(prev => ({ ...prev, isInspecting: !prev.isInspecting }));
  };

  // Handle element selection
  useEffect(() => {
    if (!state.isInspecting) return;

    const handleMouseOver = (e: MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (target === inspectorRef.current) return;
      target.style.outline = '2px solid #3b82f6';
    };

    const handleMouseOut = (e: MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (target === inspectorRef.current) return;
      target.style.outline = '';
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const target = e.target as HTMLElement;
      if (target === inspectorRef.current || inspectorRef.current?.contains(target)) return;
      setState(prev => ({
        ...prev,
        selectedElement: target,
        isInspecting: false
      }));
      setClasses(Array.from(target.classList));
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('click', handleClick);
    };
  }, [state.isInspecting]);

  // Handle class changes
  const toggleClass = (className: string) => {
    if (!state.selectedElement) return;

    const newClasses = classes.includes(className)
      ? classes.filter(c => c !== className)
      : [...classes, className];

    // Generate CSS for arbitrary values if needed
    if (className.includes('[') && className.includes(']')) {
      const css = generateTailwindClass(className);
      if (css && styleTagRef.current) {
        const existingStyles = styleTagRef.current.textContent || '';
        if (!existingStyles.includes(className)) {
          styleTagRef.current.textContent = existingStyles + `
            .${className.replace(/[\[\]#]/g, '\\$&')} {
              ${css}
            }
          `;
        }
      }
    }

    setClasses(newClasses);
    state.selectedElement.className = newClasses.join(' ');

    // Add to history
    setState(prev => ({
      ...prev,
      history: [...prev.history.slice(0, prev.historyIndex + 1), newClasses.join(' ')],
      historyIndex: prev.historyIndex + 1
    }));
  };

  // Add new class
  const addNewClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass || !state.selectedElement) return;
    
    toggleClass(newClass);
    setNewClass('');
  };

  // Handle undo/redo
  const undo = () => {
    if (state.historyIndex <= 0 || !state.selectedElement) return;
    
    const newIndex = state.historyIndex - 1;
    const previousClasses = state.history[newIndex].split(' ');
    state.selectedElement.className = state.history[newIndex];
    setClasses(previousClasses);
    setState(prev => ({ ...prev, historyIndex: newIndex }));
  };

  const redo = () => {
    if (state.historyIndex >= state.history.length - 1 || !state.selectedElement) return;
    
    const newIndex = state.historyIndex + 1;
    const nextClasses = state.history[newIndex].split(' ');
    state.selectedElement.className = state.history[newIndex];
    setClasses(nextClasses);
    setState(prev => ({ ...prev, historyIndex: newIndex }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredClasses.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredClasses.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredClasses.length) {
        toggleClass(filteredClasses[highlightedIndex]);
        setSearchTerm('');
        setFilteredClasses([]);
      }
    }
  };

  const renderDesignTab = () => (
    <div className="space-y-4">
      {/* Spacing Section */}
      <div className="border rounded-lg p-3  bg-base-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center gap-2">
            <Layout size={16} />
            Spacing
          </h3>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => toggleClass('py-[20000px]')}
            className="text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded"
          >
            py-[20000px]
          </button>
          <button 
            onClick={() => toggleClass('px-[50px]')}
            className="text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded"
          >
            px-[50px]
          </button>
        </div>
      </div>

      {/* Typography Section */}
      <div className="border rounded-lg p-3  bg-base-100" >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center gap-2">
            <Type size={16} />
            Typography
          </h3>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => toggleClass('text-[#FF0000]')}
            className="text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded"
          >
            text-[#FF0000]
          </button>
          <button 
            onClick={() => toggleClass('text-[20px]')}
            className="text-sm p-2 bg-gray-50 hover:bg-gray-100 rounded"
          >
            text-[20px]
          </button>
        </div>
      </div>

      {/* Active Classes */}
      <div className="border rounded-lg p-3  bg-base-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium flex items-center gap-2">
            <Box size={16} />
            Active Classes
          </h3>
        </div>
        <form onSubmit={addNewClass} className="mb-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="Add class (e.g., py-[20000px])"
              className="flex-1 px-3 py-2 text-sm border rounded-[24px]"
            />
            <button
              type="submit"
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus size={16} />
            </button>
          </div>
        </form>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {classes.map((className) => (
            <div
              key={className}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm"
            >
              <input
                type="checkbox"
                checked={true}
                onChange={() => toggleClass(className)}
                className="rounded border-gray-300 checkbox" 
              />
              <span className="label cursor-pointer">{className}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCodeTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
        <pre className="text-sm">
          <code>{classes.join(' ')}</code>
        </pre>
      </div>
    </div>
  );

  const renderHTMLTab = () => (
    <div className="space-y-4">
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
        <pre className="text-sm">
          <code>{state.selectedElement?.outerHTML}</code>
        </pre>
      </div>
    </div>
  );

  const renderSearchForClasses = () => (
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search Tailwind class..."
        className="border px-3 py-2 w-full rounded-[24px]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {filteredClasses.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border shadow mt-1 max-h-60 overflow-auto">
          {filteredClasses.map((cls, index) => (
            <li
              key={cls}
              className={`px-2 py-1 cursor-pointer text-sm ${
                index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                toggleClass(cls);
                setSearchTerm('');
                setFilteredClasses([]);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {cls}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-2 border rounded">
        <span className="text-sm font-medium">Use Tailwind CDN</span>
        <button
          onClick={toggleCDN}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            state.useCDN ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              state.useCDN ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {state.useCDN && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Tailwind Configuration
          </label>
          <textarea
            value={config}
            onChange={(e) => updateConfig(e.target.value)}
            className="w-full h-48 p-2 text-sm font-mono border rounded"
            placeholder="Enter Tailwind configuration..."
          />
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={inspectorRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(0, 0)',
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'auto'
      }}
      className="w-80 bg-base-200 rounded-[24px] shadow-lg border border-border flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <GripHorizontal size={20} className="text-gray-400" />
            <h2 className="text-lg font-semibold">Tailwind Inspector</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setState(prev => ({ ...prev, activeTab: 'settings' }))}
              className={`p-2 rounded-lg ${
                state.activeTab === 'settings' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
            </button>
            <button
              onClick={toggleInspector}
              className={`p-2 rounded-lg ${
                state.isInspecting ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              {state.isInspecting ? <X size={20} /> : <Crosshair size={20} />}
            </button>
          </div>
        </div>
        {LoadTailwindCDN()}
        {renderSearchForClasses()}

        {state.selectedElement && (
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              className="p-2 hover:bg-primary rounded-lg disabled:opacity-50"
              disabled={state.historyIndex <= 0}
            >
              <Undo size={16} />
            </button>
            <button
              onClick={redo}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              disabled={state.historyIndex >= state.history.length - 1}
            >
              <Redo size={16} />
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(classes.join(' '))}
              className="p-2 hover:bg-gray-100 rounded-lg ml-auto"
            >
              <Copy size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      {state.selectedElement || state.activeTab === 'settings' ? (
        <>
          <div className="flex border-b bg-base-100 border-gray-200">
            {state.selectedElement && (
              <>
                <button
                  onClick={() => setState(prev => ({ ...prev, activeTab: 'design' }))}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    state.activeTab === 'design'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Design
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, activeTab: 'code' }))}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    state.activeTab === 'code'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, activeTab: 'html' }))}
                  className={`flex-1 px-4 py-2 text-sm font-medium ${
                    state.activeTab === 'html'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  HTML
                </button>
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {state.activeTab === 'design' && renderDesignTab()}
            {state.activeTab === 'code' && renderCodeTab()}
            {state.activeTab === 'html' && renderHTMLTab()}
            {state.activeTab === 'settings' && renderSettingsTab()}
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center text-gray-500 p-4">
          <div>
            <Eye className="mx-auto mb-2" size={24} />
            <p>Click the inspect button to select an element</p>
          </div>
        </div>
      )}
    </div>
  );
}