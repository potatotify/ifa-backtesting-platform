"use client";

import {useState, useEffect} from "react";
import {useRouter, useParams} from "next/navigation";
import ResultsDisplay from "@/components/ResultsDisplay";

export default function BacktestDetailsPage() {
  const [backtest, setBacktest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      fetchBacktest(params.id);
    }
  }, [params.id]);

  async function fetchBacktest(id: string) {
    try {
      const res = await fetch(`/api/history/${id}`);
      if (!res.ok) throw new Error("Backtest not found");
      const data = await res.json();
      setBacktest(data);
    } catch (error) {
      console.error(error);
      setBacktest(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-white p-6">Loading backtest...</p>;
  }
  if (!backtest) {
    return <p className="text-white p-6">Backtest not found.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        className="mb-4 text-blue-400"
        onClick={() => router.push("/history")}
      >
        &larr; Back to History
      </button>
      <ResultsDisplay
        results={backtest.results}
        onReset={() => router.push("/")}
      />
    </div>
  );
}
