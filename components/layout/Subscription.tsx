"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "../ui/dialog";
import { FormWrapper, FormInputWrapper, FormInput } from "../ui/form";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SubscriptionDialog({
  open,
  onOpenChange,
}: SubscriptionDialogProps) {
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form fields when dialog closes
  useEffect(() => {
    if (!open) {
      // Add a small delay to ensure smooth transition when closing
      const timer = setTimeout(() => {
        setEmail("");
        setAddress("");
        setIsSubmitted(false);
        setIsLoading(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open]);

  const postUserData = async (email: string, address: string) => {
    const data = {
      email,
      move_wallet: address,
    };

    try {
      await fetch(`${process.env.NEXT_PUBLIC_TRACKIT_API_HOST}/user/store`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return true;
    } catch (error) {
      console.error("Error submitting form:", error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (email && address) {
      setIsLoading(true);
      const success = await postUserData(email, address);
      setIsLoading(false);
      if (success) {
        setIsSubmitted(true);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/70 backdrop-blur-sm" />
        <DialogContent className="border-none p-0 sm:max-w-lg max-w-[95vw] mx-auto bg-transparent shadow-none fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            className="relative overflow-hidden rounded-lg bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1519750783826-e2420f4d687f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80')",
            }}
          >
            <div className="p-6 sm:p-8 pt-10 sm:pt-12 pb-12 sm:pb-16 bg-gradient-to-b from-[#0B1121]/80 to-[#0B1121]/90">
              <div className="text-center text-white">
                {!isSubmitted ? (
                  <>
                    <DialogTitle className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                      Get Updates on
                      <br />
                      New Token Listings
                    </DialogTitle>
                    <DialogDescription className="text-base sm:text-lg mb-6 sm:mb-8 text-gray-200">
                      Sign up to get first access to all of our new tokens and
                      market alerts.
                    </DialogDescription>

                    <FormWrapper className="max-w-md">
                      <div className="space-y-3 sm:space-y-4">
                        <FormInputWrapper>
                          <FormInput
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSubmit();
                            }}
                          />
                        </FormInputWrapper>

                        <FormInputWrapper>
                          <FormInput
                            type="text"
                            placeholder="Move Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSubmit();
                            }}
                          />
                        </FormInputWrapper>

                        <Button
                          className="w-full h-10 sm:h-12 text-base sm:text-lg font-medium bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
                          onClick={handleSubmit}
                          disabled={!email || !address || isLoading}
                        >
                          {isLoading ? "SENDING..." : "SEND ME UPDATES"}
                        </Button>

                        <p className="text-xs text-gray-400 mt-2 px-2">
                          By signing up, you agree to receive updates about new
                          token listings.
                        </p>
                      </div>
                    </FormWrapper>
                  </>
                ) : (
                  <div className="py-6 sm:py-8">
                    <DialogTitle className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                      Thank you!
                    </DialogTitle>
                    <DialogDescription className="text-lg sm:text-xl text-gray-200">
                      Thank you for signing up!
                      <br />
                      Check your inbox soon for new listings from us.
                    </DialogDescription>
                    <Button
                      className="mt-6 px-6 py-2 bg-transparent hover:bg-white/10 border border-white/40 text-white rounded-md text-sm transition-colors"
                      onClick={() => onOpenChange(false)}
                    >
                      Close
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
