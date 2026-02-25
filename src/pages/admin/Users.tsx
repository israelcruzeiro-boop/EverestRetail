import { useState, useEffect } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DataTable, { Column } from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import FormField, { Input, Select } from '../../components/admin/FormField';
import EmptyState from '../../components/admin/EmptyState';
import { storageService } from '../../lib/storageService';
import { AdminUser, UserRole, UserStatus } from '../../types/admin';
import { formatDateBR } from '../../lib/format';

export default function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as UserRole,
    status: 'active' as UserStatus,
  });

  useEffect(() => {
    loadUsers();
    window.addEventListener('ENT_STORAGE_UPDATED', loadUsers);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadUsers);
  }, []);

  const loadUsers = () => {
    setUsers(storageService.getUsers());
  };

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

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      alert('Preencha todos os campos.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Email inválido.');
      return;
    }

    const all = storageService.getUsers();
    if (editingUser) {
      const updated = all.map(u => u.id === editingUser.id ? { 
        ...u, 
        ...formData,
        updatedAt: new Date().toISOString() 
      } : u);
      storageService.saveUsers(updated);
    } else {
      const newItem: AdminUser = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      storageService.saveUsers([...all, newItem]);
    }

    loadUsers();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este usuário?')) {
      const all = storageService.getUsers();
      storageService.saveUsers(all.filter(u => u.id !== id));
      loadUsers();
    }
  };

  const handleToggleStatus = (user: AdminUser) => {
    const all = storageService.getUsers();
    const updated = all.map(u => u.id === user.id ? { 
      ...u, 
      status: u.status === 'active' ? 'inactive' : 'active' as UserStatus,
      updatedAt: new Date().toISOString()
    } : u);
    storageService.saveUsers(updated);
    loadUsers();
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
      <AdminTopbar title="Usuários" actions={
        <button onClick={() => handleOpenModal()} className="px-3 md:px-4 py-2 bg-[#0052cc] text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-[#0052cc]/20 transition-all">
          <span className="hidden sm:inline">+ Novo Usuário</span>
          <span className="sm:hidden">+ Novo</span>
        </button>
      } />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <Input 
              placeholder="Buscar por nome ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 sm:flex gap-4">
            <div className="w-full sm:w-40">
              <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">Funções</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </Select>
            </div>
          </div>
        </div>

        {filteredUsers.length > 0 ? (
          <DataTable data={filteredUsers} columns={columns} />
        ) : (
          <EmptyState 
            title="Nenhum usuário encontrado" 
            description="Tente ajustar seus filtros ou busca."
            icon="🔍"
            action={<button onClick={() => {setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all');}} className="text-[#0052cc] font-bold text-sm">Limpar Filtros</button>}
          />
        )}
      </div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'} 
        footer={
          <>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-500">Cancelar</button>
            <button onClick={handleSave} className="px-6 py-2 bg-[#0052cc] text-white rounded-xl text-sm font-bold">Salvar Usuário</button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Nome Completo"><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></FormField>
          <FormField label="Email"><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Função"><Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}><option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option></Select></FormField>
            <FormField label="Status"><Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}><option value="active">Ativo</option><option value="inactive">Inativo</option></Select></FormField>
          </div>
        </div>
      </Modal>
    </>
  );
}
