import React, { useState, useEffect } from 'react';
import {
  Database,
  Code2,
  Sparkles,
  Play,
  Layers,
  KeyRound,
  FileCheck2,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { getAdbmsLabQueries } from '../services/api';

export default function AdbmsLabView() {
  const [labData, setLabData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);

  const fetchLabData = async () => {
    try {
      setLoading(true);
      const res = await getAdbmsLabQueries();
      setLabData(res.data.queries || []);
    } catch (err) {
      console.error('Failed to load ADBMS queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabData();
  }, []);

  const activeQuery = labData[activeQueryIndex];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 p-6 rounded-2xl">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              ADBMS MongoDB Aggregation Pipeline Explorer
            </h2>
            <p className="text-xs text-amber-400 font-medium">
              Live Advanced Database Concepts Showcase • Subject: ADBMS
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl mt-2 leading-relaxed">
          This interactive console demonstrates the MongoDB operations implemented for the Hotel Management System:
          multi-stage aggregation pipelines (<code>$facet</code>, <code>$lookup</code>, <code>$unwind</code>, <code>$group</code>),
          compound indexing, document referencing, and schema validation.
        </p>
      </div>

      {/* Database Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compound Indexing</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Index on <code>{'{ room: 1, checkInDate: 1, checkOutDate: 1 }'}</code> allows \(O(\log N)\) conflict
              detection for booking overlap avoidance.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Normalized References</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Reservations reference <code>Guest</code> and <code>Room</code> collections via MongoDB ObjectIds,
              joined dynamically with <code>$lookup</code> or Mongoose <code>populate</code>.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Aggregation Pipelines</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              Aggregations run on the database engine, avoiding in-memory compute on the web server for
              maximum performance.
            </p>
          </div>
        </div>
      </div>

      {/* Query Selector Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
        {labData.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setActiveQueryIndex(idx)}
            className={`pb-3 px-3 text-xs font-semibold transition border-b-2 whitespace-nowrap ${
              activeQueryIndex === idx
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {q.title.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Query Detail & Live Results */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span>Executing aggregation pipelines on MongoDB...</span>
        </div>
      ) : activeQuery ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Pipeline Code */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>MongoDB Pipeline Definition</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  Stage Count: {activeQuery.pipeline.length}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{activeQuery.title}</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                {activeQuery.description}
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-xs font-mono text-emerald-400 max-h-96 overflow-y-auto">
                <pre>{JSON.stringify(activeQuery.pipeline, null, 2)}</pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Executed live on <code>hotel_management_db</code>
              </span>
              <button
                onClick={fetchLabData}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Re-run Pipeline</span>
              </button>
            </div>
          </div>

          {/* Right: Live Query Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Real-Time Database Output</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
                  Status: 200 OK
                </span>
              </div>
              <h3 className="text-base font-bold text-white">Execution Result Document</h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Raw JSON document returned by MongoDB server:
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto text-xs font-mono text-amber-300 max-h-96 overflow-y-auto">
                <pre>{JSON.stringify(activeQuery.result, null, 2)}</pre>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ready for viva question demonstration</span>
              <span className="text-slate-500">Mongoose .aggregate()</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
