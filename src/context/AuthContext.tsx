import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AdminUser, UserRole } from '@/types/admin';
import { storageService } from '@/lib/storageService';
import { coinRepo } from '@/lib/repositories/coinRepo';
import Toast from '@/components/Toast';
import { AnimatePresence } from 'framer-motion';

interface ToastData {
  id: string;
  message: string;
  amount: number;
}

interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<AdminUser>;
  signup: (name: string, email: string, password?: string) => Promise<AdminUser>;
  logout: () => void;
  loading: boolean;
  balance: number;
  refreshBalance: () => Promise<void>;
  showToast: (message: string, amount: number) => void;
  missionStreak: { amount: number; streak: number } | null;
  setMissionStreak: (data: { amount: number; streak: number } | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: constrói AdminUser a partir dos metadados JWT (nunca falha)
const buildFromMetadata = (userId: string, metadata: any): AdminUser => ({
  id: userId,
  name: metadata?.name || 'Usuário',
  email: metadata?.email || '',
  avatarUrl: metadata?.avatar_url || null,
  role: (metadata?.role as UserRole) || 'viewer',
  userType: (metadata?.user_type || (metadata?.role === 'admin' ? 'admin' : 'user')) as 'admin' | 'user',
  coinsBalance: metadata?.coins_balance || 0,
  coinsEarnedTotal: metadata?.coins_earned_total || 0,
  currentLevel: metadata?.current_level || 1,
  xpTotal: metadata?.xp_total || 0,
  status: 'active',
  createdAt: new Date().toISOString()
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [balance, setBalance] = useState(0);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [loading, setLoading] = useState(true);
  const [missionStreak, setMissionStreak] = useState<{ amount: number; streak: number } | null>(null);

  const prevBalanceRef = useRef(0);

  const showToast = (message: string, amount: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, amount }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const refreshBalance = async () => {
    if (supabase) {
      const data = await coinRepo.getUserCoinData();
      if (data) {
        // Detectar ganho de moedas para disparar toast automático
        const hasCoinGain = data.balance > prevBalanceRef.current && prevBalanceRef.current !== 0;
        const hasXpGain = data.xpTotal > (user?.xpTotal || 0) && (user?.xpTotal || 0) !== 0;

        if (hasCoinGain) {
          const diff = data.balance - prevBalanceRef.current;
          showToast('Everest Coins!', diff);
        }

        if (hasXpGain) {
          const diffXp = data.xpTotal - (user?.xpTotal || 0);
          // Pequeno delay para não sobrepor o toast de moedas se ambos ocorrerem
          setTimeout(() => {
            showToast('XP Ganho!', diffXp);
          }, hasCoinGain ? 1000 : 0);
        }

        setBalance(data.balance);
        prevBalanceRef.current = data.balance;

        // Atualizar também no estado do usuário para consistência real-time
        const updatedUser = user ? {
          ...user,
          coinsBalance: data.balance,
          coinsEarnedTotal: data.earnedTotal,
          currentLevel: data.level,
          xpTotal: data.xpTotal
        } : null;

        setUser(updatedUser);

        // PERSISTÊNCIA: Garantir que o localStorage reflita o novo saldo/xp
        if (updatedUser) {
          localStorage.setItem('ENT_AUTH_USER', JSON.stringify(updatedUser));
        }
      }
    }
  };

  // Busca perfil com timeout de 3s para NUNCA travar a UI
  const fetchProfile = async (userId: string, metadata?: any): Promise<AdminUser | null> => {
    const fallback = metadata ? buildFromMetadata(userId, metadata) : null;
    try {
      if (!supabase) return fallback;
      const profilePromise = supabase.from('profiles').select('*').eq('id', userId).single();
      const timeoutPromise = new Promise<{ data: null }>((resolve) => setTimeout(() => resolve({ data: null }), 3000));
      const result = await Promise.race([profilePromise, timeoutPromise]) as any;
      const profile = result.data;

      if (profile) return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatar_url,
        role: profile.role,
        userType: profile.user_type,
        coinsBalance: profile.coins_balance ?? 0,
        coinsEarnedTotal: profile.coins_earned_total ?? 0,
        currentLevel: profile.current_level ?? 1,
        xpTotal: profile.xp_total ?? 0,
        status: profile.status,
        createdAt: profile.created_at
      };
      return fallback;
    } catch (err) {
      console.warn('fetchProfile timeout/error, using metadata fallback:', err);
      return fallback;
    }
  };

  useEffect(() => {
    if (user) {
      // Setar balance imediato do user para evitar flash
      const immediateBalance = user.coinsBalance || 0;
      if (prevBalanceRef.current === 0) {
        prevBalanceRef.current = immediateBalance;
      }
      setBalance(immediateBalance);
    }
  }, [user?.id]);

  // Refresh do saldo real do banco sempre que o user mudar
  useEffect(() => {
    if (user && supabase) {
      refreshBalance();
    }
  }, [user?.id]);

  useEffect(() => {
    const initAuth = async () => {
      if (!supabase) {
        const savedUser = localStorage.getItem('ENT_AUTH_USER');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setBalance(parsed.coinsBalance || 0);
        }
        setLoading(false);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.user_metadata);
          if (profile) {
            setUser(profile);
            localStorage.setItem('ENT_AUTH_USER', JSON.stringify(profile));
            // Setar balance imediato do perfil
            setBalance(profile.coinsBalance || 0);
            prevBalanceRef.current = profile.coinsBalance || 0;
          }
        }
      } catch (e) {
        console.error('Init Auth error:', e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
            const profile = await fetchProfile(session.user.id, session.user.user_metadata);
            if (profile) {
              setUser(profile);
              localStorage.setItem('ENT_AUTH_USER', JSON.stringify(profile));
              // Setar balance explicitamente
              setBalance(profile.coinsBalance || 0);
              prevBalanceRef.current = profile.coinsBalance || 0;
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('ENT_AUTH_USER');
          setBalance(0);
        }
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password?: string): Promise<AdminUser> => {
    if (!supabase) {
      const users = storageService.getUsers();
      const u = users.find(user => user.email === email && user.password === password);
      if (u) {
        setUser(u);
        localStorage.setItem('ENT_AUTH_USER', JSON.stringify(u));
        return u;
      }
      throw new Error('Credenciais inválidas (Local Storage Fallback)');
    }

    if (!password) throw new Error('Senha é obrigatória.');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (!data.user) throw new Error('Falha na autenticação');

    const metadata = data.user.user_metadata;
    const adminUser = buildFromMetadata(data.user.id, metadata);

    setUser(adminUser);
    localStorage.setItem('ENT_AUTH_USER', JSON.stringify(adminUser));

    // Enriquecimento em background
    (async () => {
      try {
        const profile = await fetchProfile(data.user.id, metadata);
        if (profile) {
          setUser(profile);
          localStorage.setItem('ENT_AUTH_USER', JSON.stringify(profile));
        }
      } catch (e) {
        console.warn('Background profile enrichment failed:', e);
      }
    })();

    return adminUser;
  };

  const signup = async (name: string, email: string, password?: string): Promise<AdminUser> => {
    if (!supabase || !password) {
      throw new Error('Operação indisponível em modo offline.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Falha ao criar conta.');

    const adminUser = buildFromMetadata(data.user.id, { name, email });
    setUser(adminUser);
    localStorage.setItem('ENT_AUTH_USER', JSON.stringify(adminUser));

    // Enriquecimento em background
    (async () => {
      for (let i = 0; i < 5; i++) {
        try {
          const profile = await fetchProfile(data.user!.id);
          if (profile && profile.coinsBalance !== undefined) {
            setUser(profile);
            localStorage.setItem('ENT_AUTH_USER', JSON.stringify(profile));
            break;
          }
        } catch { /* silent */ }
        await new Promise(r => setTimeout(r, 2000));
      }
    })();

    return adminUser;
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('ENT_AUTH_USER');
    setBalance(0);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, signup, logout, loading, balance, refreshBalance, showToast, missionStreak, setMissionStreak }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[999] flex flex-col gap-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast key={toast.id} {...toast} />
          ))}
        </AnimatePresence>
      </div>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};