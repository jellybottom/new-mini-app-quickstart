"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

// Расширяем типы, чтобы Vercel не ругался
interface ExtendedUser {
  address?: `0x${string}`;
  walletAddress?: `0x${string}`;
  displayName?: string;
}

interface ExtendedContext {
  user?: ExtendedUser;
}

export default function Home() {
  // Явно указываем типы для context
  const { isFrameReady, setFrameReady, context } = useMiniKit() as { 
    isFrameReady: boolean; 
    setFrameReady: () => void; 
    context: ExtendedContext | null 
  };

  // Проверяем адрес во всех возможных полях
  const userAddress = context?.user?.address || context?.user?.walletAddress;
  const displayName = context?.user?.displayName || "based anon";
  
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  const spawnHearts = () => {
    const newHearts = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
    }));
    setHearts((prev) => [...prev, ...newHearts].slice(-30));
    
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
    }, 3000);
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden', position: 'relative' }}>
      
      {/* Плашка Identity */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '60px', 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 1000, borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {userAddress ? (
          <Identity address={userAddress} chain={base}>
            <Avatar style={{ width: '28px', height: '28px', marginRight: '8px' }} />
            <Name style={{ color: 'white', fontSize: '14px' }} />
            <Badge />
          </Identity>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
            👋 Guest Mode (Please open in Base App/Farcaster)
          </span>
        )}
      </div>

      <div style={{ height: '60px' }}></div>

      {hearts.map((heart) => (
        <div key={heart.id} style={{ position: 'absolute', bottom: '0', left: `${heart.left}%`, fontSize: '2rem', pointerEvents: 'none', zIndex: 100, animation: 'floatUp 3s ease-out forwards' }}>
          ❤️
        </div>
      ))}
      
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img src="https://the-awesome-and-based.vercel.app/basedpepe.jpg" alt="Based Pepe" style={{ width: '150px', height: 'auto', borderRadius: '15px' }} />
          </div> 
          <h1 className={styles.title}>{minikitConfig.miniapp.name.toUpperCase()}</h1>
          <p className={styles.subtitle}>
            Hey {displayName}, You look based! ❤️ <br /> I wish you all the best!
          </p>
          <div className={styles.form}>
            <button type="button" onClick={spawnHearts} className={styles.joinButton} style={{ width: '100%', cursor: 'pointer' }}>
              FEEL THE VIBE
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100vh); opacity: 0; }
        }
      `}</style>
    </div>
  );
}