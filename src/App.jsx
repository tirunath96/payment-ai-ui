
import { useState } from 'react';
import './App.css';

export default function App() {
  const [transactionId, setTransactionId] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const investigatePayment = async () => {
    if (!transactionId.trim()) {
      setResult('Please enter a transaction ID.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await fetch(
        'http://localhost:8082/api/ai/investigate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Investigate ${transactionId.trim()}`,
          }),
        }
      );

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data || `HTTP ${response.status}`);
      }

      setResult(data);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard">
      <header className="header">
        <h1>Payment AI</h1>
        <p>Intelligent Payment Investigation Dashboard</p>
      </header>

      <section className="investigation-card">
        <h2>Investigate Transaction</h2>
        <p>Enter a transaction ID to analyse its payment and gateway status.</p>

        <div className="search-row">
          <input
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') investigatePayment();
            }}
            placeholder="Enter transaction ID (e.g. TXN1001)"
          />
          <button onClick={investigatePayment} disabled={loading}>
            {loading ? 'Investigating...' : 'Investigate'}
          </button>
        </div>
      </section>

      {result && (
        <section className="result-card">
          <h2>Investigation Results</h2>
          <pre>{result}</pre>
        </section>
      )}
    </main>
  );
}
