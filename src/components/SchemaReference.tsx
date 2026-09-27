import React, { useState } from 'react';
import {
  spreadDefinitionSchema,
  readingSchema,
  catalogSchema,
} from '../schema/rawSchemas.ts';
import { Copy, Download, Code2, Check, FileJson, Sparkles } from 'lucide-react';

export const SchemaReference: React.FC = () => {
  const [activeSchemaKey, setActiveSchemaKey] = useState<'spread' | 'reading' | 'catalog'>('spread');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');

  const activeSchema =
    activeSchemaKey === 'spread'
      ? spreadDefinitionSchema
      : activeSchemaKey === 'reading'
      ? readingSchema
      : catalogSchema;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(activeSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      activeSchemaKey === 'spread'
        ? 'tarot-spread-definition.schema.json'
        : activeSchemaKey === 'reading'
        ? 'tarot-reading.schema.json'
        : 'tarot-spread-catalog.schema.json';

    const blob = new Blob([JSON.stringify(activeSchema, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Schema Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Select Schema:
          </label>
          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveSchemaKey('spread')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSchemaKey === 'spread'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Spread Definition (v2.0.0)
            </button>
            <button
              onClick={() => setActiveSchemaKey('reading')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSchemaKey === 'reading'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Reading Record (v1.0.0)
            </button>
            <button
              onClick={() => setActiveSchemaKey('catalog')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                activeSchemaKey === 'catalog'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Catalog Manifest (v2.0.0)
            </button>
          </div>

          <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800 ml-2">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'visual' ? 'bg-slate-800 text-slate-200' : 'text-slate-500'
              }`}
            >
              Visual Reference
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'raw' ? 'bg-slate-800 text-slate-200' : 'text-slate-500'
              }`}
            >
              Raw Schema JSON
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Schema'}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Download .schema.json
          </button>
        </div>
      </div>

      {/* Meta Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-slate-400 font-medium block">Schema Canonical $id</span>
          <code className="text-indigo-400 font-mono text-[11px]">{activeSchema.$id}</code>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Draft: <strong className="text-slate-200 font-mono">2020-12</strong></span>
          <span>Title: <strong className="text-slate-200">{activeSchema.title}</strong></span>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="flex flex-col gap-6">
          {/* Top-Level Properties Table */}
          <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">Top-Level Properties</h4>
              <span className="text-xs text-slate-400 font-mono">
                required: [{(activeSchema.required as readonly string[] || []).join(', ')}]
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-medium">Property</th>
                    <th className="p-3.5 font-medium">Type</th>
                    <th className="p-3.5 font-medium">Required</th>
                    <th className="p-3.5 font-medium">Constraints / Enums</th>
                    <th className="p-3.5 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {Object.entries(activeSchema.properties as Record<string, any>).map(([propName, def]) => {
                    const isRequired = (activeSchema.required as readonly string[] || []).includes(propName);
                    return (
                      <tr key={propName} className="hover:bg-slate-900/40">
                        <td className="p-3.5 font-semibold text-indigo-300 font-mono">{propName}</td>
                        <td className="p-3.5 text-slate-400">
                          {def.type || (def.$ref ? def.$ref.split('/').pop() : 'object')}
                        </td>
                        <td className="p-3.5 font-sans">
                          {isRequired ? (
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-semibold border border-rose-800/60">
                              required
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">optional</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-400 font-sans text-[11px]">
                          {def.enum && (
                            <span className="text-amber-400 font-mono">
                              enum: [{def.enum.join(', ')}]
                            </span>
                          )}
                          {def.pattern && (
                            <span className="text-cyan-400 font-mono">pattern: {def.pattern}</span>
                          )}
                          {def.const && (
                            <span className="text-emerald-400 font-mono">const: "{def.const}"</span>
                          )}
                          {!def.enum && !def.pattern && !def.const && '-'}
                        </td>
                        <td className="p-3.5 font-sans text-slate-300 text-[11px] leading-relaxed">
                          {def.description || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* $defs Section */}
          {activeSchema.$defs && (
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-slate-200">Re-usable Model Definitions ($defs)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(activeSchema.$defs as Record<string, any>).map(([defKey, defVal]) => (
                  <div key={defKey} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-mono text-sm font-bold text-indigo-300">#/$defs/{defKey}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {defVal.type || 'object'}
                      </span>
                    </div>
                    {defVal.description && (
                      <p className="text-xs text-slate-400 font-sans">{defVal.description}</p>
                    )}
                    {defVal.properties && (
                      <div className="mt-2 text-xs font-mono space-y-1">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider block">Fields:</span>
                        {Object.entries(defVal.properties).map(([pName, pDef]: [string, any]) => (
                          <div key={pName} className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2 py-1 rounded">
                            <span className="text-slate-300">{pName}</span>
                            <span className="text-slate-500">{pDef.type || (pDef.enum ? `enum (${pDef.enum.length})` : 'ref')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Raw Schema JSON */
        <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-200 overflow-auto max-h-[700px] leading-relaxed shadow-inner">
          <pre>{JSON.stringify(activeSchema, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
