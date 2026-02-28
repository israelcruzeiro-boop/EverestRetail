import React, { useState, useEffect } from 'react';
import AdminTopbar from '@/components/admin/AdminTopbar';
import FormField, { Input, Textarea } from '@/components/admin/FormField';
import { settingsRepo, Setting } from '@/lib/repositories/settingsRepo';
import { motion } from 'framer-motion';

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await settingsRepo.getAll();
    setSettings(data);
    setLoading(false);
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      await settingsRepo.upsert(key, value);
      // Atualiza estado local
      setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    } catch (err) {
      console.error(`Erro ao salvar ${key}:`, err);
      alert('Erro ao salvar configuração.');
    } finally {
      setSaving(null);
    }
  };

  const getSettingValue = (key: string) => {
    return settings.find(s => s.key === key)?.value || {};
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const siteInfo = getSettingValue('site_info');
  const socialLinks = getSettingValue('social_links');
  const legalTexts = getSettingValue('legal_texts');

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopbar title="Configurações da Plataforma" />

      <div className="flex-1 p-6 md:p-10 space-y-12 max-w-4xl mx-auto w-full">
        {/* Informações do Site */}
        <section className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Informações do Site</h2>
              <p className="text-xs text-slate-400 font-medium">Nome, descrição e contatos básicos.</p>
            </div>
            {saving === 'site_info' && (
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Salvando...</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Nome da Plataforma">
              <Input
                value={siteInfo.name || ''}
                onChange={(e) => handleUpdateSetting('site_info', { ...siteInfo, name: e.target.value })}
                placeholder="Marketplace ENT2"
              />
            </FormField>
            <FormField label="E-mail de Suporte">
              <Input
                value={siteInfo.support_email || ''}
                onChange={(e) => handleUpdateSetting('site_info', { ...siteInfo, support_email: e.target.value })}
                placeholder="suporte@exemplo.com"
              />
            </FormField>
            <FormField label="Telefone de Contato" className="md:col-span-2">
              <Input
                value={siteInfo.support_phone || ''}
                onChange={(e) => handleUpdateSetting('site_info', { ...siteInfo, support_phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </FormField>
            <FormField label="Descrição Curta (SEO)" className="md:col-span-2">
              <Textarea
                rows={3}
                value={siteInfo.description || ''}
                onChange={(e) => handleUpdateSetting('site_info', { ...siteInfo, description: e.target.value })}
                placeholder="Uma breve descrição da plataforma..."
              />
            </FormField>
          </div>
        </section>

        {/* Redes Sociais */}
        <section className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Redes Sociais</h2>
              <p className="text-xs text-slate-400 font-medium">Links para engajamento da comunidade.</p>
            </div>
            {saving === 'social_links' && (
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Salvando...</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Instagram">
              <Input
                value={socialLinks.instagram || ''}
                onChange={(e) => handleUpdateSetting('social_links', { ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </FormField>
            <FormField label="LinkedIn">
              <Input
                value={socialLinks.linkedin || ''}
                onChange={(e) => handleUpdateSetting('social_links', { ...socialLinks, linkedin: e.target.value })}
                placeholder="https://linkedin.com/..."
              />
            </FormField>
            <FormField label="WhatsApp">
              <Input
                value={socialLinks.whatsapp || ''}
                onChange={(e) => handleUpdateSetting('social_links', { ...socialLinks, whatsapp: e.target.value })}
                placeholder="https://wa.me/..."
              />
            </FormField>
          </div>
        </section>

        {/* Textos Jurídicos */}
        <section className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <div>
              <h2 className="text-xl font-black text-slate-900">Textos Jurídicos</h2>
              <p className="text-xs text-slate-400 font-medium">Termos de uso e políticas de privacidade.</p>
            </div>
            {saving === 'legal_texts' && (
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Salvando...</span>
            )}
          </div>

          <div className="space-y-6">
            <FormField label="Termos de Uso">
              <Textarea
                rows={6}
                value={legalTexts.terms_of_use || ''}
                onChange={(e) => handleUpdateSetting('legal_texts', { ...legalTexts, terms_of_use: e.target.value })}
                placeholder="Texto dos termos de uso..."
              />
            </FormField>
            <FormField label="Política de Privacidade">
              <Textarea
                rows={6}
                value={legalTexts.privacy_policy || ''}
                onChange={(e) => handleUpdateSetting('legal_texts', { ...legalTexts, privacy_policy: e.target.value })}
                placeholder="Texto da política de privacidade..."
              />
            </FormField>
          </div>
        </section>

        <div className="flex justify-center pt-8">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">As alterações são salvas automaticamente ao digitar.</p>
        </div>
      </div>
    </div>
  );
}