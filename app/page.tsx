"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAccount, useWriteContract } from 'wagmi'; 
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'wagmi/chains';

// ABI  BasedThanks
const contractAbi = [
  {
    "inputs": [],
    "name": "sayThanks",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

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
  
  const { address: userAddress } = useAccount(); 
  const { writeContract, isPending } = useWriteContract();

  const finalAddress = context?.user?.address || userAddress;
  const displayName = context?.user?.displayName || "based anon";
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
    if (!isFrameReady) setFrameReady(true);
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

  const handleThanksJesse = () => {
    writeContract({
      address: '0x85AA7595FA68607953Db6a84030D15232Fe70D35',
      abi: contractAbi,
      functionName: 'sayThanks',
      chainId: base.id,
    }, {
      onSuccess: (hash) => {
        console.log("Tx Success! Hash:", hash);
        alert("Thanks to Jesse sent on-chain! ❤️");
        spawnHearts();
      },
      onError: (error) => {
        console.error("Tx failed:", error);
        alert("Transaction failed. Make sure you are in a Base-compatible wallet.");
      },
    });
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden', position: 'relative' }}>
      {/* Header Identity */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '60px', 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Identity address={finalAddress} chain={base}>
          <Avatar style={{ width: '28px', height: '28px', marginRight: '8px' }} />
          <Name style={{ color: 'white', fontSize: '14px' }}>
            {finalAddress ? undefined : displayName}
          </Name>
          <Badge />
        </Identity>
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
            Hey {displayName}, you look based, and if no one has told you this yet, you are wonderful just the way you are ❤️ <br /> I wish you all the best!
          </p>
          
          <div className={styles.form}>
            <button 
              type="button" 
              onClick={spawnHearts} 
              className={styles.joinButton} 
              style={{ width: '100%', cursor: 'pointer', marginBottom: '16px' }}
            >
              FEEL THE VIBE
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <button 
                onClick={handleThanksJesse}
                className={styles.thanksButton}
                disabled={isPending}
                style={{ 
                  width: '80%', 
                  background: 'rgba(0, 255, 0, 0.1)', 
                  border: '1px solid rgba(0, 255, 0, 0.3)', 
                  color: 'white', 
                  borderRadius: '20px', 
                  padding: '8px 16px', 
                  fontSize: '12px', 
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  opacity: isPending ? 0.5 : 1
                }}
              >
                {isPending ? "Sending..." : "Say Thanks to Jesse 🚀"}
              </button>
            </div>
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