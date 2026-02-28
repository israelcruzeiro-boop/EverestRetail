import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedCoinBadgeProps {
    balance: number;
    className?: string;
}

export default function AnimatedCoinBadge({ balance, className = "" }: AnimatedCoinBadgeProps) {
    const controls = useAnimation();
    const prevBalance = useRef(balance);

    useEffect(() => {
        if (balance > prevBalance.current) {
            // Animação de "ganho"
            controls.start({
                scale: [1, 1.3, 1],
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.5, ease: "easeOut" }
            });
        }
        prevBalance.current = balance;
    }, [balance, controls]);

    return (
        <motion.div
            animate={controls}
            className={`flex items-center gap-1.5 shrink-0 ${className}`}
        >
            <span className="text-amber-500 text-sm">🪙</span>
            <span className="text-[11px] font-black text-white tabular-nums">{balance}</span>
        </motion.div>
    );
}
