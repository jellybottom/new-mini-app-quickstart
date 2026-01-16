"use client";
import { useState, useEffect, useRef } from "react";
import { useQuickAuth, useMiniKit } from "@coinbase/onchainkit/minikit";
import { useRouter } from "next/navigation";
import { minikitConfig } from "../minikit.config";
import styles from "./page.module.css";

interface AuthResponse {
  success: boolean;
  user?: {
    fid: number;
    issuedAt?: number;
    expiresAt?: number;
  };
  message?: string;
}

export default function Home() {
  const { isFrameReady, setFrameReady, context } = useMiniKit();
  const [hearts, setHearts] = useState<{ id: number; left: number }[]>([]);
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  useEffect(() => () => timeoutRef.current.forEach(clearTimeout), []);

  const { data: authData, isLoading: isAuthLoading, error: authError } =
    useQuickAuth<AuthResponse>("/api/auth", { method: "GET" });

  const spawnHearts = () => {
    if (hearts.length > 50) return;
    const newHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
    }));
    setHearts((prev) => [...prev, ...newHearts]);

    const timer = setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 3000);
    timeoutRef.current.push(timer);
  };

  return (
    <div className={styles.container} style={{ overflow: 'hidden', position: 'relative' }}>
      <button className={styles.closeButton} type="button"> ✕ </button>

      <div className={styles.content}>
        <div className={styles.waitlistForm}>
          <h1 className={styles.title}>
            Join {minikitConfig.miniapp.name.toUpperCase()}
          </h1>

          <p className={styles.subtitle}>
            Hey {context?.user?.displayName || "there"}, You look based, and if no
            one has told you this yet, you are wonderful just the way you are ❤️
            <br />
            I wish you all the best!
          </p>

          <div className={styles.form}>
            {hearts.map((heart) => (
              <div
                key={heart.id}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: `${heart.left}%`,
                  fontSize: "2rem",
                  pointerEvents: "none",
                  zIndex: 100,
                  animation: "floatUp 3s ease-out forwards",
                }}
              >
                ❤️
              </div>
            ))}

            <button
              type="button"
              onClick={spawnHearts}
              className={styles.joinButton}
              style={{ width: "100%", cursor: "pointer" }}
            >
              BECOME AWESOME
            </button>
          </div>

          <style jsx global>{`
            @keyframes floatUp {
              0% { transform: translateY(0) scale(1); opacity: 1; }
              100% { transform: translateY(-100vh) scale(1.5); opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}