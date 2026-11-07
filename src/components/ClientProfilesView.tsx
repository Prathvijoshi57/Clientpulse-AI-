import React, { useState } from 'react';
import {
  Plus,
  Building2,
  Trash2,
  Edit3,
  ExternalLink,
  MessageSquarePlus,
  Brain,
  Sparkles,
  Check,
  X,
  Search
} from 'lucide-react';
import { Client } from '../types/client';

interface ClientProfilesViewProps {
  clients: Client[];
  activeClientId: string;
  onSelectClient: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onAddClient: (clientData: Partial<Client>) => Promise<void>;
  onUpdateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  onDeleteClient: (id: string) => Promise<void>;
}

export const ClientProfilesView: React.FC<ClientProfilesViewProps> = ({
  clients,
  activeClientId,
  onSelectClient,
  onNavigateTab,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    industry: '',
    monthly_value: '₹1,25,000/mo',
    status: 'Active Client',
    health_score: 90,
    notes: '',
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      company: '',
      role: '',
      industry: '',
      monthly_value: '₹1,25,000/mo',
      status: 'Active Client',
      health_score: 90,
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;
    setIsSubmitting(true);
    try {
      await onAddClient(formData);
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setIsSubmitting(true);
    try {
      await onUpdateClient(editingClient.id, editingClient);
      setEditingClient(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.company.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Client Accounts & Dossiers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage high-value accounts, track retainers, and initialize dedicated Hindsight memory banks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-900 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Client Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const isSelected = client.id === activeClientId;
          return (
            <div
              key={client.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-900 ring-1 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {client.avatar_url ? (
                      <img
                        src={client.avatar_url}
                        alt={client.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                        {client.name[0]}
                      </div>
                    )}
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        {client.name}
                      </h2>
                      <div className="text-xs font-medium text-slate-600">
                        {client.company}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {client.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {clients.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete client profile for ${client.name}?`)) {
                            onDeleteClient(client.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Industry</span>
                    <span className="font-medium text-slate-700 truncate block">
                      {client.industry}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Monthly Retainer</span>
                    <span className="font-mono font-bold text-slate-900 block">
                      {client.monthly_value}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Health Score</span>
                    <span className="font-mono font-semibold text-emerald-700 block">
                      {client.health_score}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Relationship Status</span>
                    <span className="text-slate-700 font-medium block">
                      {client.status}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <span className="text-[11px] text-slate-400 block mb-1">Strategic Context</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-3">
                    {client.notes || 'No strategic background notes provided.'}
                  </p>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  Hindsight Bank ID: bank_clientpulse_{client.id}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectClient(client.id);
                    onNavigateTab('memory');
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  Memory Bank
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onSelectClient(client.id);
                      onNavigateTab('record');
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    Record Note
                  </button>
                  <button
                    onClick={() => {
                      onSelectClient(client.id);
                      onNavigateTab('assistant');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Register New Client & Memory Bank
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Chen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Omnichannel"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chief Marketing Officer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. B2B SaaS / FinTech"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Monthly Retainer Value (₹)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹1,25,000/mo"
                    value={formData.monthly_value}
                    onChange={(e) => setFormData({ ...formData, monthly_value: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 font-mono"
                  />
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Presets:</span>
                    {['₹50,000/mo', '₹1,00,000/mo', '₹2,00,000/mo', '₹3,50,000/mo'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData({ ...formData, monthly_value: val })}
                        className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
                      >
                        {val.replace('/mo', '')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 bg-white"
                  >
                    <option value="Active Client">Active Client</option>
                    <option value="Proposal Review">Proposal Review</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Renewal Negotiation">Renewal Negotiation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Strategic Context & Initial Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Key background context, past agency friction points, stated goals..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50 shadow-xs"
                >
                  {isSubmitting ? 'Creating Bank...' : 'Create Client & Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Edit Client Profile
              </h2>
              <button
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={editingClient.company}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Role</label>
                  <input
                    type="text"
                    value={editingClient.role}
                    onChange={(e) => setEditingClient({ ...editingClient, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Retainer Value</label>
                  <input
                    type="text"
                    value={editingClient.monthly_value}
                    onChange={(e) => setEditingClient({ ...editingClient, monthly_value: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Strategic Notes</label>
                <textarea
                  rows={3}
                  value={editingClient.notes}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
