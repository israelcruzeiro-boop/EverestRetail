import { useState, useEffect, useRef } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';
import FormField, { Input, Select } from '../../components/admin/FormField';
import { storageService } from '../../lib/storageService';
import { AdminPartner, PublicationRequest, PartnerStatus, ProductStatus, AdminProduct, PartnerType } from '../../types/admin';
import { formatDateBR } from '../../lib/format';
import { isValidImageFile, readFileAsDataURL } from '../../lib/image';

type Tab = 'active' | 'requests';

export default function Partners() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [partners, setPartners] = useState<AdminPartner[]>([]);
  const [requests, setRequests] = useState<PublicationRequest[]>([]);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<AdminPartner | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PublicationRequest | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  // Form State para Parceiro
  const [partnerForm, setPartnerForm] = useState<Partial<AdminPartner>>({
    name: '', type: 'Tecnologia', contactName: '', email: '', phone: '', status: 'active', logoUrl: ''
  });

  useEffect(() => {
    loadData();
    window.addEventListener('ENT_STORAGE_UPDATED', loadData);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadData);
  }, []);

  const loadData = () => {
    setPartners(storageService.getPartners());
    setRequests(storageService.getPublicationRequests());
  };

  const handleOpenPartnerModal = (partner?: AdminPartner) => {
    if (partner) {
      setEditingPartner(partner);
      setPartnerForm({ ...partner });
    } else {
      setEditingPartner(null);
      setPartnerForm({ name: '', type: 'Tecnologia', contactName: '', email: '', phone: '', status: 'active', logoUrl: '' });
    }
    setIsPartnerModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = isValidImageFile(file);
    if (!validation.valid) { alert(validation.error); return; }
    try {
      const dataUrl = await readFileAsDataURL(file);
      setPartnerForm(prev => ({ ...prev, logoUrl: dataUrl }));
    } catch (err) { alert('Erro ao processar imagem.'); }
  };

  const handleSavePartner = () => {
    if (!partnerForm.name || !partnerForm.email) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const all = storageService.getPartners();
    if (editingPartner) {
      storageService.savePartners(all.map(p => p.id === editingPartner.id ? { ...p, ...partnerForm } as AdminPartner : p));
    } else {
      const newPartner: AdminPartner = {
        ...partnerForm,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      } as AdminPartner;
      storageService.savePartners([...all, newPartner]);
    }
    setIsPartnerModalOpen(false);
  };

  const handleDeletePartner = (id: string) => {
    if (confirm('Excluir este parceiro?')) {
      storageService.savePartners(partners.filter(p => p.id !== id));
    }
  };

  const handleRequestAction = (requestId: string, action: 'approved' | 'rejected') => {
    const allRequests = storageService.getPublicationRequests();
    const request = allRequests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequests = allRequests.map(r => 
      r.id === requestId ? { ...r, status: action, updatedAt: new Date().toISOString() } : r
    );
    storageService.savePublicationRequests(updatedRequests);

    if (action === 'approved') {
      const allPartners = storageService.getPartners();
      let partner = allPartners.find(p => p.name === request.partnerName);
      
      if (!partner) {
        partner = {
          id: Math.random().toString(36).substr(2, 9),
          name: request.partnerName,
          type: request.partnerType,
          contactName: request.requesterName,
          email: request.requesterEmail,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        storageService.savePartners([...allPartners, partner]);
      }

      const allProducts = storageService.getProducts();
      const newProduct: AdminProduct = {
        id: Math.random().toString(36).substr(2, 9),
        name: request.productName,
        category: request.category,
        status: 'pending',
        priceCents: 0,
        shortDescription: request.description,
        benefits: [],
        partnerId: partner.id,
        createdAt: new Date().toISOString(),
      };
      storageService.saveProducts([...allProducts, newProduct]);
    }
    setIsRequestModalOpen(false);
  };

  const partnerColumns: Column<AdminPartner>[] = [
    {
      header: 'Parceiro',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
            {p.logoUrl ? <img src={p.logoUrl} className="w-full h-full object-contain" /> : <span className="text-xl">🤝</span>}
          </div>
          <div>
            <p className="font-bold text-slate-900">{p.name}</p>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{p.type}</p>
          </div>
        </div>
      )
    },
    { header: 'Contato', accessor: (p) => (
      <div>
        <p className="text-xs font-bold">{p.contactName}</p>
        <p className="text-[10px] text-slate-400">{p.email}</p>
      </div>
    )},
    { header: 'Status', accessor: (p) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
        {p.status === 'active' ? 'Ativo' : 'Inativo'}
      </span>
    )},
    {
      header: 'Ações',
      align: 'right',
      accessor: (p) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleOpenPartnerModal(p)} className="text-xs font-bold text-[#1D4ED8] hover:underline">Editar</button>
          <button onClick={() => handleDeletePartner(p.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
        </div>
      )
    }
  ];

  const requestColumns: Column<PublicationRequest>[] = [
    {
      header: 'Solicitação',
      accessor: (r) => (
        <div>
          <p className="font-bold text-slate-900">{r.productName}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Empresa: {r.partnerName}</p>
        </div>
      )
    },
    { header: 'Solicitante', accessor: (r) => r.requesterName },
    { header: 'Data', accessor: (r) => formatDateBR(r.createdAt) },
    { header: 'Status', accessor: (r) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'pending' ? 'bg-blue-100 text-blue-700' : r.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {r.status === 'pending' ? 'Pendente' : r.status === 'approved' ? 'Aprovada' : 'Rejeitada'}
      </span>
    )},
    {
      header: 'Ações',
      align: 'right',
      accessor: (r) => (
        <button onClick={() => { setSelectedRequest(r); setIsRequestModalOpen(true); }} className="text-xs font-bold text-[#1D4ED8] hover:underline">
          Ver Detalhes
        </button>
      )
    }
  ];

  return (
    <>
      <AdminTopbar title="Gestão de Parceiros" actions={
        <button onClick={() => handleOpenPartnerModal()} className="px-4 py-2 bg-[#1D4ED8] text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-[#1D4ED8]/20 transition-all">
          + Novo Parceiro
        </button>
      } />
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('active')} className={`px-6 py-3 text-xs md:text-sm font-bold transition-all border-b-2 uppercase tracking-widest ${activeTab === 'active' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}>
            Parceiros Ativos
          </button>
          <button onClick={() => setActiveTab('requests')} className={`px-6 py-3 text-xs md:text-sm font-bold transition-all border-b-2 uppercase tracking-widest ${activeTab === 'requests' ? 'border-[#1D4ED8] text-[#1D4ED8]' : 'border-transparent text-slate-400'}`}>
            Solicitações {requests.filter(r => r.status === 'pending').length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>}
          </button>
        </div>

        {activeTab === 'active' ? (
          partners.length > 0 ? <DataTable data={partners} columns={partnerColumns} /> : <EmptyState title="Nenhum parceiro" description="Adicione seu primeiro parceiro estratégico." icon="🤝" />
        ) : (
          requests.length > 0 ? <DataTable data={requests.sort((a,b) => b.createdAt.localeCompare(a.createdAt))} columns={requestColumns} /> : <EmptyState title="Sem solicitações" description="Solicitações de publicação aparecerão aqui." icon="📩" />
        )}
      </div>

      {/* Modal de Parceiro */}
      <Modal isOpen={isPartnerModalOpen} onClose={() => setIsPartnerModalOpen(false)} title={editingPartner ? 'Editar Parceiro' : 'Novo Parceiro'} footer={
        <button onClick={handleSavePartner} className="px-6 py-2 bg-[#1D4ED8] text-white rounded-xl text-sm font-bold">Salvar Parceiro</button>
      }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField label="Logomarca">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {partnerForm.logoUrl ? <img src={partnerForm.logoUrl} className="w-full h-full object-contain" /> : <span className="text-2xl opacity-20">🖼️</span>}
                </div>
                <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all">Upload</button>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>
            </FormField>
            <FormField label="Nome da Empresa"><Input value={partnerForm.name} onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})} /></FormField>
            <FormField label="Tipo"><Select value={partnerForm.type} onChange={(e) => setPartnerForm({...partnerForm, type: e.target.value as any})}><option value="Tecnologia">Tecnologia</option><option value="Consultoria">Consultoria</option><option value="Fornecedor">Fornecedor</option></Select></FormField>
          </div>
          <div className="space-y-4">
            <FormField label="Nome do Contato"><Input value={partnerForm.contactName} onChange={(e) => setPartnerForm({...partnerForm, contactName: e.target.value})} /></FormField>
            <FormField label="E-mail"><Input value={partnerForm.email} onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})} /></FormField>
            <FormField label="Status"><Select value={partnerForm.status} onChange={(e) => setPartnerForm({...partnerForm, status: e.target.value as any})}><option value="active">Ativo</option><option value="inactive">Inativo</option></Select></FormField>
          </div>
        </div>
      </Modal>

      {/* Modal de Solicitação */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Detalhes da Solicitação" footer={
        selectedRequest?.status === 'pending' && (
          <div className="flex gap-3">
            <button onClick={() => handleRequestAction(selectedRequest!.id, 'rejected')} className="px-4 py-2 text-sm font-bold text-red-500">Rejeitar</button>
            <button onClick={() => handleRequestAction(selectedRequest!.id, 'approved')} className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-bold">Aprovar e Criar Parceiro</button>
          </div>
        )
      }>
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-[10px] font-black uppercase text-slate-400">Empresa</p><p className="font-bold">{selectedRequest.partnerName}</p></div>
              <div><p className="text-[10px] font-black uppercase text-slate-400">Produto</p><p className="font-bold">{selectedRequest.productName}</p></div>
              <div><p className="text-[10px] font-black uppercase text-slate-400">Solicitante</p><p className="font-bold">{selectedRequest.requesterName}</p></div>
              <div><p className="text-[10px] font-black uppercase text-slate-400">E-mail</p><p className="font-bold">{selectedRequest.requesterEmail}</p></div>
            </div>
            <div><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Descrição</p><p className="text-sm text-slate-600 leading-relaxed">{selectedRequest.description}</p></div>
          </div>
        )}
      </Modal>
    </>
  );
}