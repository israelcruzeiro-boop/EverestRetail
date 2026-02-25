interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: string;
  color: 'green' | 'blue' | 'purple' | 'orange';
}

const colorMap = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

export default function StatCard({ label, value, trend, icon, color }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend.isPositive ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-2">vs. mês anterior</p>
    </div>
  );
}
