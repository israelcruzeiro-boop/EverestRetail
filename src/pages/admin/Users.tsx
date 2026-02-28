import { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import FormField, { Input, Select } from '@/components/admin/FormField';
import EmptyState from '@/components/admin/EmptyState';
import { supabase } from '@/lib/supabase';
import { AdminUser, UserRole, UserStatus } from '@/types/admin';
import { formatDateBR } from '@/lib/format';
import { storageService } from '@/lib/storageService';
import { getLevelByScore } from '@/lib/rankingHelpers';

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as UserRole,
    status: 'active' as UserStatus,
  });
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        setUsers(storageService.getUsers());
        return;
      }

      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (!error) {
        setUsers((data || []).map(u => ({
          ...u,
          avatarUrl: u.avatar_url,
          coinsBalance: u.coins_balance,
          coinsEarnedTotal: u.coins_earned_total,
          currentLevel: u.current_level,
          createdAt: u.created_at
        })) as AdminUser[]);
      } else {
        console.error('Error loading users from Supabase:', error);
        setUsers(storageService.getUsers());
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers(storageService.getUsers());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      alert('Preencha todos os campos.');
      return;
    }

    try {
      if (editingUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUser.id);

        if (error) throw error;
      } else {
        // Para novos usuários, o ideal é usar o convite do Supabase Auth
        // Mas para manter a compatibilidade com o fluxo atual, simulamos a criação
        alert('A criação de novos usuários deve ser feita via Auth Invitation no Dashboard do Supabase.');
        return;
      }

      await loadUsers();
      setIsModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar alterações do perfil.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir este perfil? (A conta de autenticação continuará existindo no Supabase Auth)')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        await loadUsers();
      } catch (err) {
        alert('Erro ao excluir perfil.');
      }
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status: user.status === 'active' ? 'inactive' : 'active' as UserStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      await loadUsers();
    } catch (err) {
      alert('Erro ao alterar status.');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: Column<AdminUser>[] = [
    {
      header: 'Usuário',
      accessor: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
            {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{u.name}</p>
            <p className="text-[10px] text-slate-400">{u.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Função',
      accessor: (u) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          {u.role}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (u) => (
        <button
          onClick={() => handleToggleStatus(u)}
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors
            ${u.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}
          `}
        >
          {u.status === 'active' ? 'Ativo' : 'Inativo'}
        </button>
      )
    },
    { header: 'Criado em', accessor: (u) => formatDateBR(u.createdAt) },
    {
      header: 'Ações',
      align: 'right',
      accessor: (u) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleOpenModal(u)} className="text-xs font-bold text-[#0052cc] hover:underline">Editar</button>
          <button onClick={() => handleDelete(u.id)} className="text-xs font-bold text-red-500 hover:underline">Excluir</button>
        </div>
      )
    }
  ];

  return (
    <>
      <AdminTopbar title="Gestão de Acessos (Usuários)" actions={
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-[#1D4ED8] text-white font-black text-[10px] uppercase tracking-[0.3em] border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
        >
          <span className="hidden sm:inline">+ Adicionar Usuário</span>
          <span className="sm:hidden">+ Novo</span>
        </button>
      } />

      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row flex-wrap gap-6 bg-white p-8 border-4 border-[#0B1220] shadow-[10px_10px_0px_0px_rgba(11,18,32,1)] items-center">
          <div className="flex-1 w-full md:w-auto">
            <Input
              placeholder="PESQUISAR POR IDENTIDADE OU E-MAIL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">TODAS AS FUNÇÕES</option>
                <option value="admin">ADMINISTRADOR</option>
                <option value="editor">EDITOR</option>
                <option value="viewer">VISUALIZADOR</option>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">TODOS OS STATUS</option>
                <option value="active">USUÁRIOS ATIVOS</option>
                <option value="inactive">USUÁRIOS INATIVOS</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] bg-white overflow-hidden">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-[#0B1220]">Sincronizando Perfis...</div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <DataTable<AdminUser> data={filteredUsers} columns={[
              {
                header: 'IDENTIDADE DO USUÁRIO',
                accessor: (u) => (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[#0B1220] flex items-center justify-center text-xs font-black text-[#0B1220] bg-slate-50 grayscale">
                      {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex flex-col">
                      <p className="font-black text-[#0B1220] text-sm uppercase tracking-tighter leading-none mb-1">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">{u.email}</p>
                    </div>
                  </div>
                )
              },
              {
                header: 'PATENTE',
                accessor: (u) => {
                  const level = getLevelByScore(u.coinsEarnedTotal || 0);
                  return (
                    <div className="flex items-center gap-3">
                      {level.iconUrl && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-0.5">
                          <img src={level.iconUrl} alt={level.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${level.color}`}>
                        {level.name}
                      </span>
                    </div>
                  );
                }
              },
              {
                header: 'NÍVEL DE ACESSO',
                accessor: (u) => (
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#1D4ED8] border-2 border-[#0B1220] px-3 py-1 bg-white inline-block">
                    {u.role === 'admin' ? 'KEYMASTER' : u.role === 'editor' ? 'CURADOR' : 'OBSERVADOR'}
                  </span>
                )
              },
              {
                header: 'ESTADO OPERACIONAL',
                accessor: (u) => (
                  <button
                    onClick={() => handleToggleStatus(u)}
                    className={`
                      px-3 py-1 border-2 font-black uppercase tracking-widest text-[9px] transition-all
                      ${u.status === 'active' ? 'bg-[#00FF41] text-[#0B1220] border-[#0B1220] shadow-[2px_2px_0px_0px_rgba(11,18,32,1)] hover:shadow-none translate-y-0.5' : 'bg-slate-200 text-slate-500 border-[#0B1220]'}
                    `}
                  >
                    {u.status === 'active' ? 'ONLINE' : 'OFFLINE'}
                  </button>
                )
              },
              {
                header: 'DATA DE REGISTRO',
                accessor: (u) => <span className="text-[10px] font-black uppercase text-slate-400">{formatDateBR(u.createdAt)}</span>
              },
              {
                header: 'AÇÕES',
                align: 'right',
                accessor: (u) => (
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => handleOpenModal(u)}
                      className="px-3 py-1 border-2 border-[#1D4ED8] text-[9px] font-black uppercase tracking-widest text-[#1D4ED8] hover:bg-[#1D4ED8] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(29,78,216,1)] active:shadow-none"
                    >
                      EDITAR
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
                    >
                      EXCLUIR
                    </button>
                  </div>
                )
              }
            ]} />
          ) : (
            <EmptyState
              title="USUÁRIO INEXISTENTE"
              description="NENHUM REGISTRO CORRESPONDE AOS CRITÉRIOS DE FILTRAGEM."
              icon="🔍"
              action={<button onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); }} className="text-[#1D4ED8] font-black text-[10px] uppercase tracking-[0.2em] border-b-2 border-[#1D4ED8]">RESETAR BUSCA</button>}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `EDITAR PERFIL: ${editingUser.name.toUpperCase()}` : 'NEW ACCESS PROTOCOL'}
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 text-[10px] font-black text-[#0B1220] uppercase tracking-[0.3em] hover:text-[#FF4D00] transition-colors"
            >
              DESCARTAR
            </button>
            <button
              onClick={handleSave}
              className="px-10 py-4 bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-[0.5em] border-2 border-[#0B1220] shadow-[6px_6px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1.5 active:translate-y-1.5 transition-all"
            >
              SALVAR PRIVILÉGIOS
            </button>
          </div>
        }
      >
        <div className="space-y-8 py-4">
          <FormField label="Nome de Identificação"><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="NOME COMPLETO..." /></FormField>
          <FormField label="E-mail de Login"><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="EX: AGENTE@ENT.COM" /></FormField>
          <div className="grid grid-cols-2 gap-8">
            <FormField label="Nível de Autoridade">
              <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}>
                <option value="admin">ADMINISTRADOR</option>
                <option value="editor">EDITOR</option>
                <option value="viewer">VISUALIZADOR</option>
              </Select>
            </FormField>
            <FormField label="Estado Atual">
              <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}>
                <option value="active">ONLINE (ATIVO)</option>
                <option value="inactive">SUSPENSO (OFFLINE)</option>
              </Select>
            </FormField>
          </div>
          <div className="p-6 bg-[#0B1220] border-l-8 border-[#1D4ED8]">
            <p className="text-[9px] font-black text-[#1D4ED8] uppercase tracking-[0.2em]">Cuidado</p>
            <p className="text-white text-[10px] font-medium uppercase mt-2">Alterar privilégios de acesso pode afetar a segurança da operação ENT.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
