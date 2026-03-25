import { useState, useEffect } from 'react';
import { evaluate } from 'mathjs';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { HistoryEntry } from '@/components/HistoryEntry';

type HistoryItem = {
  id: number;
  expression: string;
  result: string;
  timestamp: string;
};

export default function Home() {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const buttons = [
    '7', '8', '9', '/', '(', ')',
    '4', '5', '6', '*', 'sqrt(', '^',
    '1', '2', '3', '-', 'sin(', 'cos(',
    '0', '.', '=', '+', 'tan(', 'log(',
    'C', 'CE', 'DEL', 'Ans'
  ];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleButtonClick = (value: string) => {
    if (value === '=') {
      calculateResult();
    } else if (value === 'C') {
      setExpression('');
      setResult('');
    } else if (value === 'CE') {
      setExpression('');
    } else if (value === 'DEL') {
      setExpression(prev => prev.slice(0, -1));
    } else if (value === 'Ans') {
      setExpression(prev => prev + result);
    } else {
      setExpression(prev => prev + value);
    }
  };

  const calculateResult = async () => {
    if (!expression.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expression }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.result);
        setExpression(data.result);
        fetchHistory();
        toast.success('Calculation successful!');
      } else {
        toast.error(data.error || 'Calculation failed');
      }
    } catch (error) {
      toast.error('Network error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/history', { method: 'DELETE' });
      if (response.ok) {
        setHistory([]);
        toast.success('History cleared');
      }
    } catch (error) {
      toast.error('Failed to clear history');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">Smart Calculator</h1>
          <p className="text-gray-600 text-lg md:text-xl">Advanced calculator with calculation history</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-8">
              <div className="bg-gray-50 p-4 rounded-xl mb-4">
                <div className="text-gray-500 text-sm mb-1">Expression</div>
                <div className="text-2xl md:text-3xl font-mono min-h-[2.5rem] break-all">{expression || '0'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-gray-500 text-sm mb-1">Result</div>
                <div className="text-3xl md:text-4xl font-bold text-primary-600 font-mono min-h-[3rem] break-all">{result || '0'}</div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 md:gap-4">
              {buttons.map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleButtonClick(btn)}
                  className={`
                    p-3 md:p-4 text-lg md:text-xl font-medium rounded-xl transition-all duration-200
                    ${['=', 'C', 'CE'].includes(btn) 
                      ? 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300'
                    }
                    ${btn === '=' ? 'col-span-2' : ''}
                  `}
                  disabled={loading && btn === '='}
                >
                  {btn}
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-2">Tips:</h3>
              <ul className="text-blue-700 text-sm list-disc pl-5 space-y-1">
                <li>Use sqrt() for square root, ^ for exponentiation</li>
                <li>Trigonometric functions: sin(), cos(), tan() in radians</li>
                <li>Use parentheses for complex expressions</li>
                <li>Click on history items to reuse them</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Calculation History</h2>
              <button
                onClick={clearHistory}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No calculations yet. Start calculating!
                </div>
              ) : (
                history.map((item) => (
                  <HistoryEntry
                    key={item.id}
                    item={item}
                    onUse={(expr) => {
                      setExpression(expr);
                      setResult(item.result);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <footer className="mt-8 md:mt-12 text-center text-gray-500 text-sm">
          <p>Smart Calculator • Built with Next.js, TypeScript, TypeORM, and SQLite</p>
        </footer>
      </div>
    </div>
  );
}
