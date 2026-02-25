export interface Content {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  category: string;
  image: string;
  relatedProductId?: string;
}

export const mockContent: Content[] = [
  {
    id: 'c1',
    title: 'Como o Direct-to-Consumer está redefinindo o marketplace B2B em 2024',
    excerpt: 'Análise profunda sobre as tendências de desintermediação e como indústrias estão vendendo diretamente.',
    author: 'Ana Silveira',
    readTime: '5 min leitura',
    category: 'Conversão',
    image: 'https://picsum.photos/seed/retail/800/600',
    relatedProductId: '2'
  },
  {
    id: 'c2',
    title: 'O futuro da logística: Dark stores e o last-mile ultra rápido',
    excerpt: 'Como a tecnologia está transformando a entrega final e reduzindo custos operacionais.',
    author: 'Marcos Paulo',
    readTime: '8 min leitura',
    category: 'Gestão',
    image: 'https://picsum.photos/seed/logistics/800/600',
    relatedProductId: '3'
  }
];
