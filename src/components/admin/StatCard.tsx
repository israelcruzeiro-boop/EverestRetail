interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: string;
  color: 'green' | 'blue' | 'black' | 'orange';
}

const colorMap = {
  green: 'bg-[#00FF41] border-[#0B1220]',
  blue: 'bg-[#1D4ED8] text-white border-[#0B1220]',
  black: 'bg-[#0B1220] text-white border-[#0B1220]',
  orange: 'bg-[#FF4D00] text-white border-[#0B1220]',
};

export default function StatCard({ label, value, trend, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 border-4 border-[#0B1220] shadow-[8px_8px_0px_0px_rgba(11,18,32,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
      <div className="flex items-start justify-between mb-8">
        <div className={`w-14 h-14 border-2 flex items-center justify-center ${colorMap[color]}`}>
          <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{icon}</span>
        </div>
        {trend && (
          <div className={`px-3 py-1 border-2 border-[#0B1220] font-black text-[10px] uppercase tracking-widest ${trend.isPositive ? 'bg-[#00FF41] text-[#0B1220]' : 'bg-[#FF4D00] text-white'}`}>
            {trend.value}
          </div>
        )}
      </div>
      <p className="text-[10px] font-black text-[#0B1220] uppercase tracking-[0.2em] mb-2">{label}</p>
      <h3 className="text-4xl font-black text-[#0B1220] tracking-tighter uppercase">{value}</h3>
      <div className="mt-6 pt-4 border-t-2 border-[#0B1220]/5">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-[#1D4ED8]"></span>
          Performance Operacional
        </p>
      </div>
    </div>
  );
}
