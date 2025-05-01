"use client";
import { useState, useEffect } from "react";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {jwtDecode} from "jwt-decode";
import { Button } from "../ui/Button";
import { generateNonce, generateRandomness, jwtToAddress } from '@mysten/sui/zklogin';
import { SuiClient } from "@mysten/sui/client";
import { sha256 } from "js-sha256";

const FULLNODE_URL = 'https://fullnode.devnet.sui.io';
const suiClient = new SuiClient({url: FULLNODE_URL});
const { epoch } = await suiClient.getLatestSuiSystemState();
const maxEpoch = Number(epoch) + 2; // this means the ephemeral key will be active for 2 epochs from now.
const ephemeralKeyPair = new Ed25519Keypair();
const randomness = generateRandomness();
const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);

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

    // 1️⃣ On click, generate ephemeral keypair & nonce
    const startLogin = () => {
        const keypair = new Ed25519Keypair();             // Ephemeral keypair :contentReference[oaicite:7]{index=7}
        const publicKey = keypair.getPublicKey().toBase64();
        const nonce = btoa(publicKey);                    // Simple nonce strategy

        const redirect_uri = process.env.NEXT_PUBLIC_REDIRECT_URI || "";
        const params = new URLSearchParams({
            // Configure client ID and redirect URI with an OpenID provider
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||'',
            redirect_uri: redirect_uri,
            response_type: 'id_token',
            scope: 'openid',
            nonce: nonce
        });
        
        const PROVIDER_URL = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

        window.location.href = `${PROVIDER_URL}`; // Redirect to OAuth :contentReference[oaicite:8]{index=8}
    };

    // Logout handler
    const handleLogout = () => {
        setAddress(null);
        // Clean up URL
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

    // 2️⃣ On callback, decode JWT & fetch ZK proof
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");
        if (!idToken) return;

        const { nonce } = jwtDecode<{nonce:string}>(idToken); // Get back our nonce :contentReference[oaicite:9]{index=9}
        console.log("Nonce resp: ", nonce, " -params: ", params)
        const hex = sha256(nonce);

        // 2. Convert hex into a 32-byte Uint8Array
        const seed = hexToBytes(hex);
        const keypair = Ed25519Keypair.fromSecretKey(seed);

        setAddress(keypair.toSuiAddress());        
    }, [])

    // Render login or logout UI
    if (address) {
        return (
            <div className="flex items-center space-x-2">
                <span className="text-white cursor-pointer" onClick={handleCopy} title="Copy address">
                    {shortenAddress(address)} {copied ? '(Copied)' : ''}
                </span>
                <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                    Logout
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={startLogin} className="bg-[#132d5b] hover:bg-[#1a3c73] text-white">
        Login with zkLogin
        </Button>
    );
}
