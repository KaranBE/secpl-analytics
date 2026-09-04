import React, { useState } from 'react';
import { APPS_SCRIPT_PROJECT_FILES, AppsScriptFile } from '../../data/appsScriptCode';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Terminal, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const AppsScriptViewer: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('Code.gs');
  const [copied, setCopied] = useState(false);

  const selectedFile = APPS_SCRIPT_PROJECT_FILES.find(f => f.name === selectedFileName) || APPS_SCRIPT_PROJECT_FILES[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    APPS_SCRIPT_PROJECT_FILES.forEach(file => {
      const element = document.createElement("a");
      const blob = new Blob([file.code], { type: 'text/plain' });
      element.href = URL.createObjectURL(blob);
      element.download = file.name;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Production Google Apps Script Project Repository
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Tested & Ready to Deploy
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Copy these scripts directly into your Google Sheets Script Editor (<code className="text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">Extensions &gt; Apps Script</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download All Files</span>
          </button>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File Navigator (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Project Files ({APPS_SCRIPT_PROJECT_FILES.length})
            </h4>

            <div className="space-y-1.5">
              {APPS_SCRIPT_PROJECT_FILES.map((file) => {
                const isSelected = selectedFileName === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => setSelectedFileName(file.name)}
                    className={`w-full text-left p-3 rounded-xl text-xs font-mono transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-indigo-50/80 text-indigo-900 border border-indigo-200 font-bold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2">
                        <FileCode className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                        {file.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">{file.type}</span>
                    </div>
                    <span className="text-[11px] font-sans text-slate-500 line-clamp-1">{file.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Step Setup Instructions */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              3-Step Deployment Guide
            </h4>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                <span className="font-bold text-indigo-600">Step 1: Create Apps Script</span>
                <p className="text-[11px] text-slate-500">
                  Open your Master Sheet &rarr; Click <strong className="text-slate-700">Extensions &gt; Apps Script</strong> &rarr; Create files matching the names on the left.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                <span className="font-bold text-indigo-600">Step 2: Deploy Webhook</span>
                <p className="text-[11px] text-slate-500">
                  Click <strong className="text-slate-700">Deploy &gt; New Deployment &gt; Web App</strong> &rarr; Execute as "Me", Who has access: "Anyone". Paste URL into Meta WhatsApp Webhook.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1">
                <span className="font-bold text-indigo-600">Step 3: Run Triggers</span>
                <p className="text-[11px] text-slate-500">
                  In Apps Script editor, run <code className="text-indigo-600 font-mono bg-indigo-50 px-1 rounded">setupAllTriggers()</code> once to schedule the 6 PM daily & Monday 9 AM reports.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Viewer (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px]">
          {/* Top Bar */}
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400">{selectedFile.name}</span>
              <span className="text-xs text-slate-400">&bull; {selectedFile.description}</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy File'}</span>
            </button>
          </div>

          {/* Syntax Highlighted Code Display */}
          <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-200 bg-slate-950 leading-relaxed">
            <pre>{selectedFile.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
