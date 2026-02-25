import { Link } from 'react-router-dom';
import { Content } from '../data/mockContent';

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  return (
    <article className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="relative h-56">
        <img 
          src={content.image} 
          alt={content.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#0052cc] uppercase">
            {content.category}
          </span>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-white flex items-center gap-1">
          <span className="text-xs">{content.readTime}</span>
        </div>
      </div>
      <div className="p-5">
        <Link 
          to={content.relatedProductId ? `/product/${content.relatedProductId}` : '#'}
          className="block"
        >
          <h4 className="text-lg font-bold leading-snug mb-2 hover:text-[#0052cc] transition-colors">
            {content.title}
          </h4>
        </Link>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
          {content.excerpt}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-400">
                {content.author.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-700">{content.author}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
