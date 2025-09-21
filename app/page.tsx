"use client";

import { useState } from "react";

type Channel = "sms" | "whatsapp";

export default function Home() {
  const [channel, setChannel] = useState<Channel>("sms");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const requestSandwiches = async () => {
    setLoading(true);
    setMessage(null);

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
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Are There Sandwiches?
          </h1>
          <p className="text-gray-600">Let them know you want sandwiches!</p>
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
              "🥪 Request Sandwiches!"
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
    </main>
  );
}
