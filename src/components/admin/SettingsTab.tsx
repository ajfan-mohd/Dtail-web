import React from 'react';
import { Folder, Image, Users, RefreshCw, Info } from 'lucide-react';

type SettingsTabProps = {
  totalCategories: number;
  totalProjects: number;
  totalClients: number;
  onReset: () => void;
};

export default function SettingsTab({
  totalCategories,
  totalProjects,
  totalClients,
  onReset,
}: SettingsTabProps) {
  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
          Admin Overview
        </h2>
        <p className="text-gray-500 text-sm">
          Quick summary of your live portfolio content.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <Folder className="text-brand mb-6" size={36} />
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
            Categories
          </p>
          <h3 className="text-5xl font-black mt-2">{totalCategories}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <Image className="text-brand mb-6" size={36} />
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
            Projects
          </p>
          <h3 className="text-5xl font-black mt-2">{totalProjects}</h3>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <Users className="text-brand mb-6" size={36} />
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest">
            Clients
          </p>
          <h3 className="text-5xl font-black mt-2">{totalClients}</h3>
        </div>
      </div>

      <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 space-y-6">
        <div className="flex items-center gap-4 text-brand">
          <Info size={28} />
          <h2 className="text-2xl font-black uppercase tracking-tighter">
            Quick Admin Guide
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-400">
          <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-white font-bold uppercase mb-2">Add Project</h3>
            <p>Open a portfolio folder, upload image, then click Add to Folder.</p>
          </div>

          <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-white font-bold uppercase mb-2">Set Cover</h3>
            <p>Open any folder and upload a thumbnail from the Set Cover button.</p>
          </div>

          <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-white font-bold uppercase mb-2">Add Client</h3>
            <p>Go to Clients tab, upload logo, add name, then save partner.</p>
          </div>
        </div>
      </div>

      <div className="bg-red-500/5 p-10 rounded-[3rem] border border-red-500/20 space-y-5">
        <div className="flex items-center gap-4">
          <RefreshCw className="text-red-500" size={30} />
          <div>
            <h2 className="text-2xl font-black uppercase text-red-500 tracking-tighter">
              Maintenance
            </h2>
            <p className="text-gray-500 text-sm">
              Use only if the admin UI looks stuck or cached.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Clear local cache and refresh?')) onReset();
          }}
          className="px-8 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-all uppercase tracking-widest"
        >
          Clear Local Cache
        </button>
      </div>
    </div>
  );
}