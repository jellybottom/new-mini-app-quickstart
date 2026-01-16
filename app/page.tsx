"use client";
import { useState, useEffect } from "react";
import { useQuickAuth,useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number; // FID is the unique identifier for the user
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string; // Error messages come as 'message' not 'error'
}


export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
  const router = useRouter();

  // Initialize the  miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);
 
  

  // If you need to verify the user's identity, you can use the useQuickAuth hook.
  // This hook will verify the user's signature and return the user's FID. You can update
  // this to meet your needs. See the /app/api/auth/route.ts file for more details.
  // Note: If you don't need to verify the user's identity, you can get their FID and other user data
  // via `context.user.fid`.
  // const { data, isLoading, error } = useQuickAuth<{
  //   userFid: string;
  // }>("/api/auth");

  const { data: authData, isLoading: isAuthLoading, error: authError } = useQuickAuth<AuthResponse>(
    "/api/auth",
    { method: "GET" }
  );

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check authentication first
    if (isAuthLoading) {
      setError("Please wait while we verify your identity...");
      return;
    }

    if (authError || !authData?.success) {
      setError("Please authenticate to join the waitlist");
      return;
    }

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // TODO: Save email to database/API with user FID
    console.log("Valid email submitted:", email);
    console.log("User authenticated:", authData.user);
    
    // Navigate to success page
    router.push("/success");
  };

const spawnHearts = () => {
  const newHearts = Array.from({ length: 15 }).map((_, i) => ({
    id: Date.now() + i,
    left: Math.random() * 100,
  }));
  setHearts((prev) => [...prev, ...newHearts]);
  setTimeout(() => {
    setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
  }, 3000);
};

  return (
    <div className={styles.container}>
      <button className={styles.closeButton} type="button">
        ✕
      </button>
      
      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <h1 className={styles.title}>Join {minikitConfig.miniapp.name.toUpperCase()}</h1>
          
          <p className={styles.subtitle}>
             Hey {context?.user?.displayName || "there"}, You look based, and if no one has told you this yet, you are wonderful just the way you are ❤️ <br /> I wish you all the best!
          </p>

          <div className={styles.form}>
  {/* АНИМАЦИЯ */}
  {hearts.map((heart) => (
    <div key={heart.id} style={{ position: 'absolute', bottom: '0', left: `${heart.left}%`, fontSize: '2rem', pointerEvents: 'none', zIndex: 100, animation: 'floatUp 3s ease-out forwards' }}>
      ❤️
    </div>
  ))}

  <button 
    type="button" 
    onClick={spawnHearts} 
    className={styles.joinButton}
    style={{ width: '100%', cursor: 'pointer' }}
  >
    BECOME AWESOME
  </button>

  {/* СТИЛЬ АНИМАЦИИ */}
  <style jsx global>{`
    @keyframes floatUp {
      0% { transform: translateY(0) scale(1); opacity: 1; }
      100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
    }
  `}</style>
</div>
        </div>
      </div>
    </div>
  );
}
