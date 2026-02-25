import { useState, useEffect } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import EmptyState from '../../components/admin/EmptyState';
import { storageService } from '../../lib/storageService';
import { AdminPartner, PublicationRequest, PartnerStatus, ProductStatus, AdminProduct } from '../../types/admin';
import { formatDateBR } from '../../lib/format';

interface GroupedPartner {
  partnerName: string;
  partnerType: string;
  pendingCount: number;
  totalCount: number;
  lastRequestDate: string;
  requests: PublicationRequest[];
}

export default function Partners() {
  const [requests, setRequests] = useState<PublicationRequest[]>([]);
  const [groupedPartners, setGroupedPartners] = useState<GroupedPartner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<GroupedPartner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
    window.addEventListener('ENT_STORAGE_UPDATED', loadData);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadData);
  }, []);

  const loadData = () => {
    const allRequests = storageService.getPublicationRequests();
    setRequests(allRequests);

    // Group by partnerName
    const groups: Record<string, GroupedPartner> = {};
    allRequests.forEach(req => {
      if (!groups[req.partnerName]) {
        groups[req.partnerName] = {
          partnerName: req.partnerName,
          partnerType: req.partnerType,
          pendingCount: 0,
          totalCount: 0,
          lastRequestDate: req.createdAt,
          requests: []
        };
      }
      
      const group = groups[req.partnerName];
      group.totalCount++;
      if (req.status === 'pending') group.pendingCount++;
      if (new Date(req.createdAt) > new Date(group.lastRequestDate)) {
        group.lastRequestDate = req.createdAt;
      }
      group.requests.push(req);
    });

    setGroupedPartners(Object.values(groups).sort((a, b) => b.pendingCount - a.pendingCount));
  };

  const handleOpenPartner = (partner: GroupedPartner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
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
      // 1. Create Partner if not exists
      const allPartners = storageService.getPartners();
      let partner = allPartners.find(p => p.name === request.partnerName);
      
      if (!partner) {
        partner = {
          id: Math.random().toString(36).substr(2, 9),
          name: request.partnerName,
          type: request.partnerType,
          contactName: request.requesterName,
          email: request.requesterEmail,
          status: 'active' as PartnerStatus,
          createdAt: new Date().toISOString(),
        };
        storageService.savePartners([...allPartners, partner]);
      }

      // 2. Create Product
      const allProducts = storageService.getProducts();
      const newProduct: AdminProduct = {
        id: Math.random().toString(36).substr(2, 9),
        name: request.productName,
        category: request.category,
        status: 'pending' as ProductStatus,
        priceCents: 0, // Admin will set later
        shortDescription: request.description,
        benefits: [],
        partnerId: partner.id,
        createdAt: new Date().toISOString(),
      };
      storageService.saveProducts([...allProducts, newProduct]);
    }

    // Update local state for modal
    if (selectedPartner) {
      const updatedPartnerRequests = selectedPartner.requests.map(r => 
        r.id === requestId ? { ...r, status: action } : r
      );
      setSelectedPartner({
        ...selectedPartner,
        requests: updatedPartnerRequests,
        pendingCount: updatedPartnerRequests.filter(r => r.status === 'pending').length
      });
    }
  };

  const columns: Column<GroupedPartner>[] = [
    {
      header: 'Parceiro',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-lg">🤝</div>
          <div>
            <p className="font-bold text-slate-900">{p.partnerName}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{p.partnerType}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Solicitações',
      accessor: (p) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900">{p.totalCount}</span>
          {p.pendingCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              {p.pendingCount} Pendente{p.pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )
    },
    { header: 'Última em', accessor: (p) => formatDateBR(p.lastRequestDate) },
    {
      header: 'Ações',
      align: 'right',
      accessor: (p) => (
        <button 
          onClick={() => handleOpenPartner(p)}
          className="text-xs font-bold text-[#0052cc] hover:underline"
        >
          Gerenciar Solicitações
        </button>
      )
    }
  ];

  return (
    <>
      <AdminTopbar title="Solicitações de Parceiros" />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {groupedPartners.length === 0 ? (
          <EmptyState 
            title="Nenhuma solicitação de publicação ainda" 
            description="As solicitações feitas pelos usuários aparecerão aqui para aprovação." 
            icon="🤝" 
          />
        ) : (
          <DataTable data={groupedPartners} columns={columns} />
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Solicitações: ${selectedPartner?.partnerName}`}
        size="xl"
      >
        <div className="space-y-6">
          {selectedPartner?.requests.map(req => (
            <div key={req.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-black text-slate-900">{req.productName}</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0052cc]">{req.category}</span>
                </div>
                <span className={`
                  px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
                  ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 
                    req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                    'bg-blue-100 text-blue-700'}
                `}>
                  {req.status === 'approved' ? 'Aprovado' : req.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Solicitante</p>
                  <p className="font-bold text-slate-700">{req.requesterName}</p>
                  <p className="text-xs text-slate-500">{req.requesterEmail}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Data</p>
                  <p className="font-bold text-slate-700">{formatDateBR(req.createdAt)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Descrição</p>
                <p className="text-sm text-slate-600 leading-relaxed">{req.description}</p>
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => handleRequestAction(req.id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
                  >
                    Aprovar Publicação
                  </button>
                  <button 
                    onClick={() => handleRequestAction(req.id, 'rejected')}
                    className="flex-1 bg-white border border-red-200 text-red-600 py-2 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors"
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
