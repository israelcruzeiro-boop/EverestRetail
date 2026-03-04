import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import DataTable, { Column } from '@/components/admin/DataTable';
import Modal from '@/components/admin/Modal';
import FormField, { Input, Select, Textarea } from '@/components/admin/FormField';
import EmptyState from '@/components/admin/EmptyState';
import { storeRepo, StoreItem } from '@/lib/repositories/storeRepo';
import { formatBRLFromCents } from '@/lib/format'; // Here price is in EC, we might adapt formatting

export default function StoreManagement() {
    const [items, setItems] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StoreItem | null>(null);

    // States para Formulário
    const [formData, setFormData] = useState<Partial<StoreItem>>({
        code: '',
        name: '',
        description: '',
        price: 0,
        benefit_type: 'xp',
        benefit_value: 0,
        is_active: true
    });

    const loadItems = async () => {
        setLoading(true);
        // getItems do storeRepo pega apenas ativos, então vou fazer query direta pra pegar tudo pro admin
        const { supabase } = await import('@/lib/supabase');
        if (supabase) {
            const { data } = await supabase.from('store_items').select('*').order('created_at', { ascending: false });
            setItems(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadItems();
    }, []);

    const handleOpenModal = (item?: StoreItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({ ...item });
        } else {
            setEditingItem(null);
            setFormData({
                code: '',
                name: '',
                description: '',
                price: 0,
                benefit_type: 'xp',
                benefit_value: 0,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.code || formData.price === undefined) {
            alert('Preencha nome, código e preço.');
            return;
        }

        try {
            await storeRepo.saveItem(formData as Partial<StoreItem>);
            await loadItems();
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving store item:', err);
            alert('Erro ao salvar item.');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Tem certeza que deseja excluir o item "${name}"? Essa ação não pode ser desfeita e afetará o histórico.`)) {
            try {
                await storeRepo.deleteItem(id);
                await loadItems();
            } catch (err) {
                alert('Erro ao excluir item da loja.');
            }
        }
    };

    const columns: Column<StoreItem>[] = [
        {
            header: 'ITEM',
            accessor: (p) => (
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 border-2 border-[#0B1220] overflow-hidden flex items-center justify-center text-xl shrink-0">
                        {p.benefit_type === 'xp' ? '🔋' : '📡'}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-[#0B1220] text-sm uppercase tracking-tighter">{p.name}</span>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{p.code}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'TIPO BENEFÍCIO',
            accessor: (p) => (
                <span className="text-[10px] font-black px-3 py-1 bg-white border-2 border-[#0B1220] uppercase tracking-widest text-[#0B1220]">
                    {p.benefit_type === 'xp' ? 'EXPERIÊNCIA (XP)' : 'OVERRIDE (BOOST)'}
                </span>
            )
        },
        {
            header: 'VALOR GERADO',
            accessor: (p) => (
                <span className="font-black text-[#0B1220] text-base">+{p.benefit_value} {p.benefit_type === 'xp' ? 'XP' : 'DIAS'}</span>
            )
        },
        {
            header: 'CUSTO (COINS)',
            accessor: (p) => (
                <div className="flex flex-col">
                    <span className="font-black text-cyan-600 text-base">{p.price} EC</span>
                </div>
            )
        },
        {
            header: 'STATUS',
            accessor: (p) => (
                <span className={`
          inline-flex items-center gap-2 px-3 py-1 border-2 font-black uppercase tracking-widest text-[9px]
          ${p.is_active ? 'bg-[#00FF41] text-[#0B1220] border-[#0B1220]' : 'bg-slate-200 text-slate-600 border-[#0B1220]'}
        `}>
                    <span className={`w-1.5 h-1.5 ${p.is_active ? 'bg-[#0B1220]' : 'bg-white'}`}></span>
                    {p.is_active ? 'ATIVO NA LOJA' : 'OCULTO'}
                </span>
            )
        },
        {
            header: 'AÇÕES',
            align: 'right',
            accessor: (p) => (
                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => handleOpenModal(p)}
                        className="px-3 py-1 border-2 border-[#0052cc] text-[9px] font-black uppercase tracking-widest text-[#0052cc] hover:bg-[#0052cc] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,82,204,1)] active:shadow-none"
                    >
                        EDITAR
                    </button>
                    <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="px-3 py-1 border-2 border-[#FF4D00] text-[9px] font-black uppercase tracking-widest text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(255,77,0,1)] active:shadow-none"
                    >
                        EXCLUIR
                    </button>
                </div>
            )
        }
    ];

    return (
        <>
            <AdminTopbar
                title="Estoque: Loja EC"
                actions={
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-3 px-6 py-3 bg-[#1D4ED8] text-white font-black text-[10px] uppercase tracking-[0.3em] border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                        + Adicionar Item EC
                    </button>
                }
            />

            <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12">
                {loading ? (
                    <div className="h-64 flex items-center justify-center border-4 border-[#0B1220] bg-white">
                        <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Consultando Banco de Dados...</div>
                    </div>
                ) : items.length === 0 ? (
                    <EmptyState
                        title="LOJA VAZIA"
                        description="NENHUM ITEM CADASTRADO PARA VENDA VIA EVEREST COINS."
                        icon="🪙"
                        action={
                            <button
                                onClick={() => handleOpenModal()}
                                className="bg-[#1D4ED8] text-white px-10 py-5 font-black text-xs uppercase tracking-[0.4em] border-2 border-[#0B1220] shadow-[8px_8px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                            >
                                CRIAR ITEM NA LOJA
                            </button>
                        }
                    />
                ) : (
                    <div className="border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] bg-white overflow-hidden">
                        <DataTable data={items} columns={columns} />
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? `EDITAR: ${editingItem.name}` : 'NOVO ITEM NA LOJA EC'}
                size="md"
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
                            SALVAR ITEM
                        </button>
                    </div>
                }
            >
                <div className="space-y-6">
                    <FormField label="Nome do Item">
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="EX: PACOTE DE XP, DESTAQUE"
                        />
                    </FormField>

                    <FormField label="Código Único (Sem Espaços)">
                        <Input
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                            placeholder="EX: xp_pack_500"
                        />
                    </FormField>

                    <FormField label="Descrição Comercial">
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Explique o que o usuário ganha..."
                            rows={3}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Preço (Custo em Everest Coins)">
                            <Input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                                placeholder="EX: 100"
                            />
                        </FormField>

                        <FormField label="Status na Vitrine">
                            <Select
                                value={formData.is_active ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                            >
                                <option value="true">ATIVO E VISÍVEL</option>
                                <option value="false">OCULTO / PAUSADO</option>
                            </Select>
                        </FormField>
                    </div>

                    <div className="p-6 bg-slate-50 border-l-4 border-[#1D4ED8] space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0B1220]">Mecânica do Benefício</h4>
                        <div className="grid grid-cols-2 gap-6">
                            <FormField label="Tipo de Impacto">
                                <Select
                                    value={formData.benefit_type}
                                    onChange={(e) => setFormData({ ...formData, benefit_type: e.target.value as 'xp' | 'boost' })}
                                >
                                    <option value="xp">INJETAR XP FÍSICO</option>
                                    <option value="boost">IMPULSIONAR PUBLICAÇÃO</option>
                                </Select>
                            </FormField>

                            <FormField label={formData.benefit_type === 'xp' ? 'Quantidade Extra de XP' : 'Dias de Impulsionamento'}>
                                <Input
                                    type="number"
                                    value={formData.benefit_value}
                                    onChange={(e) => setFormData({ ...formData, benefit_value: parseInt(e.target.value) || 0 })}
                                    placeholder={formData.benefit_type === 'xp' ? "EX: 50" : "EX: 7"}
                                />
                            </FormField>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
