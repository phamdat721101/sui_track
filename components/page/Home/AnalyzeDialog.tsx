import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "../../ui/Button";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// ---- Mock analysis data (replace with API fetch later) ----
interface AnalysisResponse {
  price: number;
  indicators: { rsi: number; macd: { macd: number; signal: number; histogram: number } };
  chart: Array<{ timestamp: string; price: number }>;
  prediction: { min: number; max: number; confidence?: number };
}

const mockAnalysisData: AnalysisResponse = {
  price: 127.34,
  indicators: { rsi: 58, macd: { macd: 1.23, signal: 0.95, histogram: 0.28 } },
  chart: [
    { timestamp: "00:00", price: 120.12 },
    { timestamp: "01:00", price: 121.50 },
    { timestamp: "02:00", price: 123.10 },
    { timestamp: "03:00", price: 122.75 },
    { timestamp: "04:00", price: 124.20 },
    { timestamp: "05:00", price: 126.00 },
    { timestamp: "06:00", price: 127.34 },
  ],
  prediction: { min: 114.61, max: 140.07, confidence: 0.87 },
};

interface AnalyzeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dex: string;
  tab: string;
}

export default function AnalyzeDialog({ open, onOpenChange, dex, tab }: AnalyzeDialogProps) {
  const [phase, setPhase] = useState<'loading' | 'chart' | 'result'>('loading');
  const [chartData, setChartData] = useState<{ x: string; y: number }[]>([]);
  const [price, setPrice] = useState<number>(0);
  const [rsi, setRsi] = useState<number>(0);
  const [prediction, setPrediction] = useState<{ min: number; max: number; confidence?: number }>({ min: 0, max: 0 });

  useEffect(() => {
    if (!open) return;
    setPhase('loading');
    const timer = setTimeout(() => {
      const data = mockAnalysisData;
      setChartData(data.chart.map(c => ({ x: c.timestamp, y: c.price })));
      setPrice(data.price);
      setRsi(data.indicators.rsi);
      setPrediction(data.prediction);
      setPhase('chart');
      setTimeout(() => setPhase('result'), 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60" />
        <Dialog.Content className="fixed inset-0 sm:inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full sm:w-[90%] max-w-2xl h-full sm:h-auto bg-[#0e203f] p-4 sm:p-6 md:p-8 rounded-none sm:rounded-lg overflow-y-auto max-h-screen">
          <Dialog.Title className="w-full text-center sm:text-left text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-gray-100 whitespace-normal">
            Detailed Analysis: {tab} on FlowX
          </Dialog.Title>

          {phase === 'loading' && (
            <div className="flex flex-col items-center justify-center h-40 sm:h-48 md:h-56">
              <Loader2 className="animate-spin w-8 h-8 text-white mb-2" />
              <span className="text-gray-300 text-sm sm:text-base">Fetching analysis data...</span>
            </div>
          )}

          {phase === 'chart' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-around items-center text-gray-200 gap-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold text-white">${price.toFixed(2)}</div>
                  <div className="text-xs sm:text-sm text-gray-400">Current Price</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-4xl font-bold text-green-400">{rsi}</div>
                  <div className="text-xs sm:text-sm text-gray-400">RSI</div>
                </div>
              </div>

              <div className="h-40 sm:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, bottom: 5 }}>
                    <XAxis dataKey="x" tick={{ fill: '#ccc', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#ccc', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1a2a4a', borderColor: '#0e203f' }} itemStyle={{ color: '#fff' }} />
                    <Line type="monotone" dataKey="y" stroke="#82ca9d" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {phase === 'result' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6 p-4 bg-[#132d5b] rounded-lg text-center space-y-1">
              <div className="text-base sm:text-xl text-gray-200">📊 Allocation Range</div>
              <div className="text-xl sm:text-3xl font-bold text-white">
                ${prediction.min.toFixed(2)} – ${prediction.max.toFixed(2)}
              </div>
              {prediction.confidence != null && <div className="text-xs sm:text-sm text-gray-400">Confidence: {(prediction.confidence * 100).toFixed(0)}%</div>}
            </motion.div>
          )}

          <div className="mt-6 flex justify-center sm:justify-end">
            <Button size="sm" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
