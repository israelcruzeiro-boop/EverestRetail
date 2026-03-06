import React, { useState, useRef } from 'react';
import { blogRepo } from '@/lib/repositories/blogRepo';
import { storageUploadRepo } from '@/lib/repositories/storageUploadRepo';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@/components/Icons';
import FormField, { Input, Textarea } from '@/components/admin/FormField';
import { isValidImageFile } from '@/lib/image';

export default function CreatePost() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validation = isValidImageFile(file);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        try {
            setIsSubmitting(true);
            const url = await storageUploadRepo.uploadPartnerImage(file, 'blog');
            setImageUrl(url);
        } catch (err: any) {
            alert(err.message || 'Erro ao carregar imagem.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim() || isSubmitting) {
            alert('Preencha pelo menos o título e o conteúdo.');
            return;
        }

        setIsSubmitting(true);
        try {
            await blogRepo.createPost({
                title,
                content,
                image_url: imageUrl
            });
            navigate('/blog');
        } catch (err) {
            alert('Erro ao publicar post estratégico.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-16 pb-12 px-4 text-slate-900">
            <div className="max-w-3xl mx-auto space-y-12">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-[#0B1220] transition-colors"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Retornar ao Feed
                </button>

                <div className="bg-white border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(11,18,32,1)] overflow-hidden">
                    <div className="bg-[#0B1220] p-6 text-white">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Novo Insight</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1D4ED8] mt-1">Compartilhe sua visão com o ecossistema Everest</p>
                    </div>

                    <form onSubmit={handleSave} className="p-6 space-y-6">
                        <FormField label="Título do Insight">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="EX: A NOVA ERA DA LOGÍSTICA PREDITIVA"
                                className="!text-xl font-black text-[#0B1220] placeholder:text-slate-200"
                            />
                        </FormField>

                        <FormField label="Conteúdo Estratégico">
                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Desenvolva sua análise técnica aqui..."
                                rows={8}
                                className="font-medium text-slate-600"
                            />
                        </FormField>

                        <FormField label="Imagem de Destaque">
                            <div className="space-y-6">
                                {imageUrl ? (
                                    <div className="aspect-video bg-slate-100 border-4 border-[#0B1220] overflow-hidden relative group">
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl('')}
                                            className="absolute top-4 right-4 w-10 h-10 bg-[#FF4D00] text-white border-2 border-[#0B1220] font-black flex items-center justify-center shadow-lg"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-video bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all group"
                                    >
                                        <span className="text-4xl group-hover:scale-110 transition-transform">🖼️</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 underline">Vincular Mídia Visual</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </FormField>

                        <div className="pt-6 border-t-4 border-slate-50 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-12 py-5 bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-[0.5em] border-2 border-[#0B1220] shadow-[8px_8px_0px_0px_rgba(11,18,32,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:translate-x-1.5 active:translate-y-1.5 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'PUBLICANDO...' : 'PUBLICAR INSIGHT'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
