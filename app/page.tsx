"use client";
import { useState, useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useAuthenticate } from "@coinbase/onchainkit/minikit";
import { useAccount, useReadContract } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental';
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';
import { encodeFunctionData } from 'viem';
import sdk from '@farcaster/frame-sdk';


const checkInAbi = [
  {
    "inputs": [{"name": "message", "type": "string"}],
    "name": "checkIn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalCheckIns",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;


interface ExtendedUser {
  fid?: number;
  address?: `0x${string}` | undefined;
  displayName?: string | undefined;
  pfpUrl?: string | undefined; 
}

interface ExtendedContext {
  user?: ExtendedUser | undefined;
}

interface MiniKitReturn {
  context: ExtendedContext;
  isFrameReady: boolean;
  setFrameReady: (ready: boolean) => void;
  // s
  sendTransactions: (payload: {
    calls: { to: `0x${string}`; value: string; data: string }[];
  }) => Promise<{ transactionHash?: string }>;
}

export default function Home() {
  // @ts-expect-error: cast for extended types 
  const miniKit = useMiniKit() as MiniKitReturn;
  const { isFrameReady, setFrameReady, context } = miniKit;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user: _authUser, authenticate } = useAuthenticate() as any;
  const { address: userAddress } = useAccount(); // address optional, Identity handles undefined
  const { sendCalls, isPending } = useSendCalls();

  const displayName = context?.user?.displayName || "based anon";
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);

  useEffect(() => {
  const init = async () => {
    try {
      // mini app ready
      await sdk.actions.ready(); 
      console.log("Mini App SDK: Ready signal sent");
    } catch (e) {
      console.error("SDK ready error:", e);
    }
    
    if (!isFrameReady) {
      setFrameReady(true);
    }
  };

  init();
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

  const { data: totalCheckIns } = useReadContract({
  address: '0x535e5aaB048e7f9EE75A679aFbACD0156AdCABb6',
  abi: checkInAbi,
  functionName: 'totalCheckIns',
  query: {
    refetchInterval: 2000, 
  }
});


   const handleCheckIn = () => {
  if (!userAddress) {
    alert("Connect wallet first!");
    return;
  }

  // (calldata)
  const callData = encodeFunctionData({
    abi: checkInAbi,
    functionName: 'checkIn',
    args: ["Checked in cause I'm based and awesome!🐸💎"],
  });

  sendCalls({
    calls: [
      {
        to: '0x535e5aaB048e7f9EE75A679aFbACD0156AdCABb6',
        data: callData,
        // @ts-ignore
        metadata: {
          title: "The Awesome And Based App",
          description: "Checking in to the Based Hall of Fame 🐸",
          faviconUrl: "https://the-awesome-and-based.vercel.app/basedpepe.jpg",
          hostname: "the-awesome-and-based.vercel.app",
        },
      },
    ],
    capabilities: {
      paymasterService: {
        // Alchemy
        url: `https://api.g.alchemy.com/stg/v1/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}/paymaster`,
      },
    },
  });
};


  return (
    <div className={styles.container} style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '60px', 
        backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        zIndex: 1000, borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {userAddress || context?.user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Identity cover, Warpcast */}
            {userAddress && (
              <div style={{ background: 'transparent', display: 'flex', alignItems: 'center' }}>
                <Identity 
                  address={userAddress} 
                  schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de9531794c6ca19"
                  chain={base}
                  className="bg-transparent"
                >
                  <Avatar address={userAddress} style={{ width: '28px', height: '28px' }} />
                  <Name address={userAddress} style={{ color: 'white', fontSize: '14px', marginLeft: '8px' }} />
                  <Badge />
                </Identity>
              </div>
            )}
            
            {/* section Farcaster */}
            {context?.user?.pfpUrl && (
              <div style={{ display: 'flex', alignItems: 'center', borderLeft: userAddress ? '1px solid rgba(255,255,255,0.2)' : 'none', paddingLeft: userAddress ? '8px' : '0' }}>
                <img 
                  src={context.user.pfpUrl} 
                  alt="Farcaster PFP" 
                  style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid rgba(0, 82, 255, 0.5)' }} 
                />
                {!userAddress && (
                  <span style={{ color: 'white', fontSize: '12px', marginLeft: '8px', opacity: 0.8 }}>
                    {context.user.displayName}
                  </span>
                )}
              </div>
            )}
          </div>
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
          
          {/*  Flex */}
          <div className={styles.form} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '4px', fontWeight: '700', textShadow: '0px 0px 8px rgba(0, 82, 255, 0.4)' }}>
            {totalCheckIns !== undefined 
            ? `${totalCheckIns.toString()} based people checked in` 
            : 'Loading stats...'}
            </p>

            <button 
              type="button" 
              onClick={spawnHearts} 
              className={styles.joinButton} 
              style={{ width: '100%', cursor: 'pointer' }}
            >
              FEEL THE VIBE
            </button>

            <button 
              onClick={handleCheckIn}
              disabled={isPending}
              style={{ 
              width: '100%', 
              background: 'rgba(0, 82, 255, 0.2)', 
              border: '1px solid rgba(0, 82, 255, 0.4)', 
              color: 'white', 
              borderRadius: '12px', 
              padding: '12px', 
              fontSize: '14px', 
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
              }}
              >
              {isPending ? 'CHECKING IN...' : 'ON-CHAIN CHECK-IN 🚀'}
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