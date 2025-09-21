"use client";

import { useState, useEffect } from "react";
import SandwichRain from "@/components/SandwichRain";

type Channel = "sms" | "whatsapp";
type PageState = "asking" | "checking" | "no" | "requesting";

export default function Home() {
  const [pageState, setPageState] = useState<PageState>("asking");
  const [channel, setChannel] = useState<Channel>("sms");
  const [loading, setLoading] = useState(false);
  const [rainTriggerCount, setRainTriggerCount] = useState(0);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
    isRateLimited?: boolean;
    secondsLeft?: number;
    baseMessage?: string;
  } | null>(null);

  // Countdown timer effect for rate limit messages
  useEffect(() => {
    if (message?.isRateLimited && message.secondsLeft && message.secondsLeft > 0) {
      console.log('Setting up countdown timer, current seconds:', message.secondsLeft);
      const timer = setTimeout(() => {
        setMessage(prev => {
          if (!prev || !prev.isRateLimited || !prev.secondsLeft) return prev;
          const newSeconds = prev.secondsLeft - 1;
          console.log('Countdown tick:', newSeconds);
          if (newSeconds <= 0) {
            return null; // Clear message when countdown reaches 0
          }
          // Update the message with new seconds count - handle both abbreviated "30s" and full "30 seconds"
          const updatedText = prev.text.replace(/\d+\s*s(?:econds?)?/g, `${newSeconds}s`);
          return {
            ...prev,
            text: updatedText,
            secondsLeft: newSeconds
          };
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [message?.secondsLeft]); // Only re-run when secondsLeft changes

  const checkForSandwiches = () => {
    setPageState("checking");
    setTimeout(() => {
      setPageState("no");
      setTimeout(() => {
        setPageState("requesting");
      }, 1500); // Show NO for 1.5 seconds before showing request button
    }, 2000); // Show checking animation for 2 seconds
  };

  const requestSandwiches = async () => {
    setLoading(true);
    setMessage(null);
    setRainTriggerCount(prev => prev + 1); // Increment to trigger new rain

    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setMessage({ type: "success", text: "🥪 Sandwich request sent!" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      console.log('Error message received:', errorMessage);

      // Check if it's a rate limit error with seconds (handles both "30 seconds" and "30s")
      const secondsMatch = errorMessage.match(/(\d+)\s*s(?:econds?)?/);
      console.log('Seconds match result:', secondsMatch);

      if (secondsMatch) {
        const seconds = parseInt(secondsMatch[1]);
        console.log('Rate limit detected, starting countdown from:', seconds);
        setMessage({
          type: "error",
          text: errorMessage,
          isRateLimited: true,
          secondsLeft: seconds,
          baseMessage: errorMessage
        });
      } else {
        setMessage({
          type: "error",
          text: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SandwichRain triggerCount={rainTriggerCount} />
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
        {pageState === "asking" && (
          <div className="w-full max-w-2xl space-y-12 text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-800">
              Are there sandwiches<br />right now?
            </h1>
            <button
              onClick={checkForSandwiches}
              className="px-8 py-4 text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 text-white rounded-2xl hover:from-orange-500 hover:to-yellow-500 transform hover:scale-105 transition-all shadow-xl"
            >
              🥪 Check
            </button>
          </div>
        )}

        {pageState === "checking" && (
          <div className="text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl md:text-4xl text-gray-700">Checking for sandwiches</h2>
            <div className="flex justify-center space-x-4">
              <span className="text-6xl animate-pulse animation-delay-0">.</span>
              <span className="text-6xl animate-pulse animation-delay-200">.</span>
              <span className="text-6xl animate-pulse animation-delay-400">.</span>
            </div>
          </div>
        )}

        {pageState === "no" && (
          <div className="animate-bounce-in">
            <h1 className="text-8xl md:text-9xl font-black text-red-600">
              NO
            </h1>
          </div>
        )}

        {pageState === "requesting" && (
        <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Still no sandwiches? 😢
          </h1>
          <p className="text-xl text-gray-600">Send a <span className="font-bold text-orange-500 text-2xl">REAL</span> text message to Noah<br/>to demand sandwiches NOW!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-2 hidden">
            <label className="text-sm font-medium text-gray-700">
              Send via:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setChannel("sms")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  channel === "sms"
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100"
                }`}
              >
                📱 SMS
              </button>
              <button
                onClick={() => setChannel("whatsapp")}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  channel === "whatsapp"
                    ? "bg-green-100 text-green-700 border-2 border-green-300"
                    : "bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100"
                }`}
              >
                💬 WhatsApp
              </button>
            </div>
          </div>

          <button
            onClick={requestSandwiches}
            disabled={loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform ${
              loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-400 to-yellow-400 text-white hover:from-orange-500 hover:to-yellow-500 hover:scale-105 active:scale-95 shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </span>
            ) : (
              "🥪 Demand Sandwiches NOW!"
            )}
          </button>

          {message && (
            <div
              className={`p-4 rounded-lg text-center animate-fade-in ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
      )}
      </main>
    </>
  );
}
