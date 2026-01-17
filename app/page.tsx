"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAuthenticate } from "@coinbase/onchainkit/minikit";
import { useAccount } from 'wagmi';
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import Image from 'next/image'; 


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
  
  const { user: _authUser, authenticate } = useAuthenticate(); 
  const { address: userAddress } = useAccount(); // address optional, Identity handles undefined
  
  // @ts-expect-error: displayName optional in context
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
            
            <Image 
              src="https://the-awesome-and-based.vercel.app/basedpepe.jpg" 
              alt="Based Pepe" 
              width={150}
              height={150} 
              style={{ borderRadius: '15px' }}
              priority 
            />
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