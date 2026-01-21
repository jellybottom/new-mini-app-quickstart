"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAuthenticate } from "@coinbase/onchainkit/minikit";
import { useAccount } from 'wagmi';
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';


interface ExtendedUser {
  fid?: number;
  address?: `0x${string}` | undefined;
  displayName?: string | undefined;
}

interface ExtendedContext {
  user?: ExtendedUser | undefined;
}

interface MiniKitReturn {
  context: ExtendedContext;
  isFrameReady: boolean;
  setFrameReady: (ready: boolean) => void;
  
}

export default function Home() {
  // @ts-expect-error: cast for extended types 
  const miniKit = useMiniKit() as MiniKitReturn;
  const { isFrameReady, setFrameReady, context } = miniKit;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user: _authUser, authenticate } = useAuthenticate() as any;
  const { address: userAddress } = useAccount(); // address optional, Identity handles undefined
  

  const displayName = context?.user?.displayName || "based anon";
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    if (!isFrameReady) setFrameReady(true);
  }, [isFrameReady, setFrameReady]);

  const handleLogin = async () => {
    if (!isFrameReady) {
      alert("Please open this in the Base / Coinbase Wallet app");
      return;
    }
    try {
      const authenticatedUser = await authenticate();
      if (authenticatedUser) {
        console.log("Authenticated! FID:", authenticatedUser.fid);
      }
    } catch (error) {
      console.error("Auth failed", error);
    }
  };

const sayThanksToJesse = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Селектор функции sayThanks(string) — это первые 4 байта хеша названия функции
      const functionSelector = '0x14068308';
      
      // Правильно закодированные параметры для строки "Thanks!"
      const data = functionSelector + 
        '0000000000000000000000000000000000000000000000000000000000000020' + // Смещение данных
        '0000000000000000000000000000000000000000000000000000000000000007' + // Длина строки (7 символов)
        '5468616e6b732100000000000000000000000000000000000000000000000000';   // "Thanks!" в Hex

      const transactionParameters = {
        to: '0x292d678b248D9915C7565FF17296C8242fF8ccF8', // Твой контракт
        from: accounts[0],
        value: '0x5AF3107A4000', // 0.0001 ETH
        data: data,
      };

      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      alert("Based! Gratitude sent to Jesse on-chain.");
    } catch (error: any) {
      console.error("Full error:", error);
      // Если это ошибка внутри Base App, она может быть связана с провайдером
      alert("Error: " + (error?.message || "Check console"));
    }
  } else {
    alert("Please open this in Base Wallet!");
  }
};

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
          <button 
            onClick={handleLogin}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.2)', 
              color: 'white', 
              borderRadius: '20px', 
              padding: '6px 16px', 
              fontSize: '12px', 
              cursor: 'pointer' 
            }}
            disabled={!isFrameReady}
          >
            Verify Wallet
          </button>
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://the-awesome-and-based.vercel.app/basedpepe.jpg" 
              alt="Based Pepe" 
              style={{ width: '150px', height: '150px', borderRadius: '15px', objectFit: 'cover' }} 
            />
          </div>

          <h1 className={styles.title}>{minikitConfig.miniapp.name.toUpperCase()}</h1>
          <p className={styles.subtitle}>
            Hey {displayName}, You look based, and if no one has told you this yet, you are wonderful just the way you are ❤️ <br /> I wish you all the best!
          </p>
          <div className={styles.form}>
            <button type="button" onClick={spawnHearts} className={styles.joinButton} style={{ width: '100%', cursor: 'pointer' }}>
              FEEL THE VIBE
            </button>

  
            <button 
            type="button" 
            onClick={sayThanksToJesse} 
            className={styles.joinButton} 
            style={{ 
            width: '100%', 
            cursor: 'pointer', 
            backgroundColor: '#0052ff', // Фирменный синий цвет Base
            marginTop: '10px'
            }}
            >
            SAY THANKS TO JESSE 🔵
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