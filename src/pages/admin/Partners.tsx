import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import EmptyState from '@/components/admin/EmptyState';
import { partnersRepo, PartnerRow } from '@/lib/repositories/partnersRepo';
import { publicationRequestsRepo, PublicationRequestRow } from '@/lib/repositories/publicationRequestsRepo';
import { formatDateBR } from '@/lib/format';

type Tab = 'partners' | 'requests';
type RequestFilter = 'all' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export default function Partners() {
  const [activeTab, setActiveTab] = useState<Tab>('partners');
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [requests, setRequests] = useState<PublicationRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState<RequestFilter>('all');

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<PublicationRequestRow | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [pts, reqs] = await Promise.all([
      partnersRepo.listPartnersAdmin(),
      publicationRequestsRepo.listRequestsAdmin()
    ]);
    setPartners(pts);
    setRequests(reqs);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // ---- Partner Actions ----
  const handlePartnerStatusChange = async (partnerId: string, status: 'pending' | 'approved' | 'blocked') => {
    try {
      await partnersRepo.updatePartnerStatus(partnerId, status);
      await loadData();
    } catch (err) {
      alert('Erro ao alterar status do parceiro.');
    }
  };

  // ---- Request Actions ----
  const handleApprove = async (requestId: string) => {
    if (!confirm('Aprovar esta solicitação? Um produto será criado automaticamente.')) return;
    setActionLoading(true);
    try {
      const productId = await publicationRequestsRepo.approveRequest(requestId);
      await loadData();
      if (productId) {
        alert(`Produto criado com sucesso! ID: ${productId}`);
      }
    } catch (err: any) {
      console.error('Erro ao aprovar:', err);
      alert(err.message || 'Erro ao aprovar solicitação.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (req: PublicationRequestRow) => {
    setSelectedRequest(req);
    setRejectNotes('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      await publicationRequestsRepo.rejectRequest(selectedRequest.id, rejectNotes);
      await loadData();
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao rejeitar solicitação.');
    } finally {
      setActionLoading(false);
    }
  };

  // ---- Filtered Requests ----
  const filteredRequests = requestFilter === 'all'
    ? requests
    : requests.filter(r => r.status === requestFilter);

  // ---- Status Badges ----
  const partnerStatusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pendente' },
      approved: { bg: 'bg-green-50', text: 'text-green-600', label: 'Aprovado' },
      blocked: { bg: 'bg-red-50', text: 'text-red-600', label: 'Bloqueado' },
    };
    const { bg, text, label } = map[s] || map.pending;
    return <span className={`${bg} ${text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>{label}</span>;
  };

  const requestStatusBadge = (s: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Enviada' },
      under_review: { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Em Análise' },
      approved: { bg: 'bg-green-50', text: 'text-green-600', label: 'Aprovada' },
      rejected: { bg: 'bg-red-50', text: 'text-red-600', label: 'Rejeitada' },
    };
    const { bg, text, label } = map[s] || map.submitted;
    return <span className={`${bg} ${text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>{label}</span>;
  };

  // ---- Columns ----
  const partnerColumns: Column<PartnerRow>[] = [
    {
      header: 'Parceiro',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            {p.logo_url ? <img src={p.logo_url} className="w-full h-full object-contain" alt={p.company_name} /> : <span className="text-xl">🤝</span>}
          </div>
          <div>
            <p className="font-bold text-slate-900">{p.company_name}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{p.contact_email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contato',
      accessor: (p) => (
        <div>
          <p className="text-xs font-bold">{p.contact_name || '—'}</p>
          <p className="text-[10px] text-slate-400">{p.contact_phone || ''}</p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (p) => partnerStatusBadge(p.status)
    },
    {
      header: 'Solicitações',
      accessor: (p) => {
        const count = requests.filter(r => r.partner_id === p.id).length;
        return <span className="text-xs font-bold">{count}</span>;
      }
    },
    {
      header: 'Criado em',
      accessor: (p) => <span className="text-xs text-slate-400">{formatDateBR(p.created_at)}</span>
    },
    {
      header: 'Ações',
      accessor: (p) => (
        <div className="flex gap-2">
          {p.status !== 'approved' && (
            <button
              onClick={() => handlePartnerStatusChange(p.id, 'approved')}
              className="text-[10px] font-black text-green-600 uppercase tracking-wider hover:text-green-700"
            >
              Aprovar
            </button>
          )}
          {p.status !== 'blocked' && (
            <button
              onClick={() => handlePartnerStatusChange(p.id, 'blocked')}
              className="text-[10px] font-black text-red-600 uppercase tracking-wider hover:text-red-700"
            >
              Bloquear
            </button>
          )}
        </div>
      )
    }
  ];

  const requestColumns: Column<PublicationRequestRow>[] = [
    {
      header: 'Solicitação',
      accessor: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.name}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{r.type} • {r.category || 'SaaS'}</p>
        </div>
      )
    },
    {
      header: 'Descrição',
      accessor: (r) => (
        <p className="text-xs text-slate-500 max-w-[200px] truncate" title={r.short_description || r.description || ''}>
          {r.short_description || r.description || '—'}
        </p>
      )
    },
    {
      header: 'Preço',
      accessor: (r) => (
        <span className="text-xs font-bold">
          {r.price_cents > 0 ? `R$ ${(r.price_cents / 100).toFixed(2)}/${r.billing_period === 'yearly' ? 'ano' : 'mês'}` : 'Grátis'}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (r) => requestStatusBadge(r.status)
    },
    {
      header: 'Data',
      accessor: (r) => <span className="text-xs text-slate-400">{formatDateBR(r.created_at)}</span>
    },
    {
      header: 'Ações',
      accessor: (r) => (
        <div className="flex gap-2">
          {(r.status === 'submitted' || r.status === 'under_review') && (
            <>
              <button
                onClick={() => handleApprove(r.id)}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-green-700 disabled:opacity-50"
              >
                Aprovar
              </button>
              <button
                onClick={() => handleOpenReject(r)}
                disabled={actionLoading}
                className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-red-100 disabled:opacity-50"
              >
                Rejeitar
              </button>
            </>
          )}
          {r.status === 'approved' && r.created_product_id && (
            <a
              href={`/product/${r.created_product_id}`}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-100"
            >
              Ver Produto
            </a>
          )}
          {r.status === 'rejected' && r.admin_notes && (
            <span className="text-[10px] text-red-400 italic max-w-[150px] truncate" title={r.admin_notes}>
              💬 {r.admin_notes}
            </span>
          )}
        </div>
      )
    }
  ];

  const filterButtons: { value: RequestFilter; label: string }[] = [
    { value: 'all', label: `Todas (${requests.length})` },
    { value: 'submitted', label: `Enviadas (${requests.filter(r => r.status === 'submitted').length})` },
    { value: 'under_review', label: `Em Análise (${requests.filter(r => r.status === 'under_review').length})` },
    { value: 'approved', label: `Aprovadas (${requests.filter(r => r.status === 'approved').length})` },
    { value: 'rejected', label: `Rejeitadas (${requests.filter(r => r.status === 'rejected').length})` },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopbar
        title="Parceiros & Solicitações"
      />

      <div className="flex-1 p-6 md:p-10 space-y-8">
        {/* Tabs */}
        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-white w-fit">
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'partners' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Parceiros ({partners.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'requests' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Solicitações ({requests.length})
          </button>
        </div>

        {/* Partners Tab */}
        {activeTab === 'partners' && (
          partners.length === 0 ? (
            <EmptyState
              icon="🤝"
              title="Nenhum parceiro cadastrado"
              description="Os parceiros aparecerão aqui quando usuários enviarem solicitações de publicação."
            />
          ) : (
            <DataTable
              data={partners}
              columns={partnerColumns}
            />
          )
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {filterButtons.map(fb => (
                <button
                  key={fb.value}
                  onClick={() => setRequestFilter(fb.value)}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${requestFilter === fb.value
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200'
                    }`}
                >
                  {fb.label}
                </button>
              ))}
            </div>

            {filteredRequests.length === 0 ? (
              <EmptyState
                icon="📩"
                title="Nenhuma solicitação encontrada"
                description="As solicitações dos parceiros aparecerão aqui."
              />
            ) : (
              <DataTable
                data={filteredRequests}
                columns={requestColumns}
              />
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => { setIsRejectModalOpen(false); setSelectedRequest(null); }}
        title="Rejeitar Solicitação"
        size="md"
      >
        <div className="space-y-6">
          {selectedRequest && (
            <div className="bg-slate-50 rounded-2xl p-5">
              <p className="font-bold text-sm">{selectedRequest.name}</p>
              <p className="text-xs text-slate-400 mt-1">{selectedRequest.short_description || selectedRequest.description}</p>
            </div>
          )}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3">
              Motivo da Rejeição (visível para o solicitante)
            </label>
            <textarea
              rows={3}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-2 focus:ring-red-600/10 transition-all resize-none"
              placeholder="Explique o motivo..."
              value={rejectNotes}
              onChange={e => setRejectNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="px-8 py-3 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-50"
            >
              {actionLoading ? 'Rejeitando...' : 'Confirmar Rejeição'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}