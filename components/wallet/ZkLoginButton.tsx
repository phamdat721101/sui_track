"use client";
import { useState, useEffect } from "react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {jwtDecode} from "jwt-decode";
import { Button } from "../ui/Button";
import { generateNonce, generateRandomness, jwtToAddress } from '@mysten/sui/zklogin';
import { SuiClient } from "@mysten/sui/client";
import { sha256 } from "js-sha256";
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import axios from "axios";

// Utility: turn hex string into Uint8Array
function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
}

// Utility to shorten an address: first 6 and last 4 chars
function shortenAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ZkLoginButton() {
    const [address, setAddress] = useState<string|null>(null);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    // 1️⃣ On click, generate ephemeral keypair & nonce
    const startLogin = async () => {
        const FULLNODE_URL = 'https://fullnode.testnet.sui.io:443';
        const suiClient = new SuiClient({url: FULLNODE_URL});
        const { epoch } = await suiClient.getLatestSuiSystemState();
        const maxEpoch = Number(epoch) + 2;
        const ephemeralKeyPair = new Ed25519Keypair();
        const randomness = generateRandomness();
        const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

        const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI || "";
        const params = new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||'',
            redirect_uri: redirect_uri,
            response_type: 'id_token',
            scope: 'openid email profile',
            nonce: nonce
        });
        
        const PROVIDER_URL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

        window.location.href = PROVIDER_URL;
    };

    // Logout handler
    const handleLogout = () => {
        setAddress(null);
        if (window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    };

    // Copy handler
    const handleCopy = () => {
        if (address) {
            navigator.clipboard.writeText(address).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    // 2️⃣ On callback, decode JWT & fetch ZK proof, then call auth APIs
    useEffect(() => {
        const handleAuthFlow = async () => {
            const hash = window.location.hash.slice(1);
            const params = new URLSearchParams(hash);
            const idToken = params.get("id_token");
            if (!idToken) return;

            try {
                // 2.1 Exchange Google ID token for app JWT
                const loginRes = await axios.post(
                    `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/user/auth/login`,
                    { id_token: idToken }
                );
                const appJwt = loginRes.data.jwt_token;

                // 2.2 Store JWT and retrieve Sui wallet address
                const { email } = jwtDecode<{ email: string }>(idToken);
                console.log("Email zk request: ", email)
                const storeRes = await axios.post(
                    `${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/user/auth/store`,
                    { 
                        id_token: idToken, 
                        email: email
                    },
                    { headers: { Authorization: `Bearer ${appJwt}` } },
                );

                // 2.3 Set derived address from server
                setAddress(storeRes.data.wallet);
            } catch (err) {
                console.error("Auth API error:", err);
            }
        };

        handleAuthFlow();
    }, []);

    // Render login or logout UI
    if (address) {
        return (
            <div className="relative flex items-center space-x-2 flex-nowrap relative">
                <span
                    className="text-white cursor-pointer whitespace-nowrap"
                    onClick={() => setShowQR(prev => !prev)}
                    title="Click to show QR / Copy on long press"
                >
                {shortenAddress(address)} {copied ? '(Copied)' : ''}
                </span>
                <Button onClick={handleCopy} className="bg-gray-600 hover:bg-gray-700 text-white">
                Copy
                </Button>
                <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                Logout
                </Button>
                {showQR && (
                <div className="absolute top-full mt-2 p-2 bg-white rounded shadow-lg z-50 pointer-events-auto">
                    <QRCode value={address} size={128} />
                </div>
                )}
            </div>
        );
    }

    return (
        <Button onClick={startLogin} className="bg-[#132d5b] hover:bg-[#1a3c73] text-white">
            Login
        </Button>
    );
}
