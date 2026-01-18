"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount, useSendTransaction } from 'wagmi'; 
import styles from "./page.module.css";
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';

interface ExtendedUser {
  fid?: number;
  address?: `0x${string}`;
  displayName?: string;
}

interface MiniKitReturn {
  context: { user?: ExtendedUser };
  isFrameReady: boolean;
  setFrameReady: (ready: boolean) => void;
}

export default function Home() {
  // @ts-expect-error: cast types
  const miniKit = useMiniKit() as MiniKitReturn;
  const { address: userAddress } = useAccount(); 
  const { sendTransaction, isPending } = useSendTransaction();

  const finalAddress = miniKit?.context?.user?.address || userAddress;
  const displayName = miniKit?.context?.user?.displayName || "based anon";
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    if (miniKit && !miniKit.isFrameReady) {
      miniKit.setFrameReady(true);
    }
  }, [miniKit]);

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

  const handleThanksJesse = () => {
    if (!finalAddress) {
      alert("Please connect your wallet first!");
      return;
    }

    sendTransaction({
      to: '0x85AA7595FA68607953Db6a84030D15232Fe70D35',
      data: '0x3233c70f', 
    }, {
      onSuccess: (hash) => {
        alert(`SENT! Hash: ${hash.substring(0, 10)}...`);
        spawnHearts();
      },
      onError: (err) => {
        alert("Error: " + (err instanceof Error ? err.message : "Rejected"));
      }
    });
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '60px', 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}>
        <Identity address={finalAddress} chain={base}>
          <Avatar style={{ width: '28px', height: '28px', marginRight: '8px' }} />
          <Name style={{ color: 'white' }}>{finalAddress ? undefined : displayName}</Name>
          <Badge />
        </Identity>
      </div>

      <div style={{ height: '60px' }}></div>

      {hearts.map((h) => (
        <div key={h.id} style={{ position: 'absolute', bottom: '0', left: `${h.left}%`, fontSize: '2rem', animation: 'floatUp 3s forwards' }}>❤️</div>
      ))}
      
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <img 
              src="https://the-awesome-and-based.vercel.app/basedpepe.jpg" 
              alt="Based Pepe" 
              style={{ width: '150px', height: '150px', borderRadius: '15px', objectFit: 'cover' }} 
            />
          </div>
          <h1 className={styles.title}>BASED APP</h1>
          <p className={styles.subtitle}>Stay Based, {displayName} ❤️</p>
          
          <div className={styles.form}>
            <button onClick={spawnHearts} className={styles.joinButton} style={{ width: '100%', marginBottom: '16px' }}>
              FEEL THE VIBE
            </button>

            <button 
              onClick={handleThanksJesse}
              disabled={isPending}
              style={{ 
                width: '100%', background: 'rgba(0, 255, 0, 0.1)', border: '1px solid green', 
                color: 'white', borderRadius: '20px', padding: '12px',
                cursor: isPending ? 'not-allowed' : 'pointer'
              }}
            >
              {isPending ? "Confirming..." : "Say Thanks to Jesse 🚀"}
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