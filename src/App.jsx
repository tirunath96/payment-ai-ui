
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef, useMemo, memo, useCallback} from 'react';
import './App.css';

  
const SummaryCard = memo(function SummaryCard({ title, value }) {
    return (
        <div className="summary-card">
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    );
});


const InvestigateButton = memo(function InvestigateButton({
    onClick,
    loading
}) {
    console.log("InvestigateButton rendered");

    return (
        <button onClick={onClick} disabled={loading}>
            {loading ? "Investigating..." : "Investigate"}
        </button>
    );
});


export default function App() {
  const [transactionId, setTransactionId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState('');
  const [error, setError] = useState("");
  const transactionInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const stats = useMemo(() => ({
    total: transactions.length,
    successful: transactions.filter(
        tx => tx.status?.toUpperCase() === "SUCCESS"
    ).length,
    failed: transactions.filter(
        tx => tx.status?.toUpperCase() === "FAILED"
    ).length
}), [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
        const matchesSearch = transaction.transactionId
            ?.toLowerCase()
            .includes(searchTerm.trim().toLowerCase());

        const matchesStatus =
            statusFilter === "ALL" ||
            transaction.status?.toUpperCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });
}, [transactions, searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize)
);

const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
);

  useEffect(() => {
    fetch("http://localhost:8081/api/payments")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load transactions");
            }
            return response.json();
        })
        .then(data => {
            setTransactions(data);
            setError("");
        })
        .catch(error => {
            setError(error.message);
        })
        .finally(() => {
            setLoading(false);
        });
}, []);

  useEffect(() => {
    setCurrentPage(1);
}, [searchTerm, statusFilter]);

  useEffect(() => {
    transactionInputRef.current?.focus();
}, []);

  
const investigatePayment = useCallback(async () => {
    if (!transactionId.trim()) {
        setResult("Please enter a transaction ID.");
        return;
    }

    setLoading(true);
    setResult("");

    try {
        const response = await fetch(
            "http://localhost:8082/api/ai/investigate",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: `Investigate ${transactionId.trim()}`,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                typeof data === "string"
                    ? data
                    : `HTTP ${response.status}`
            );
        }

        setResult(data.analysis);
        setRiskLevel(data.riskLevel);
    } catch (error) {
        setResult(`Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
}, [transactionId]);


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
            ref={transactionInputRef}
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') investigatePayment();
            }}
            placeholder="Enter transaction ID (e.g. TXN1001)"
          />
          <InvestigateButton
    onClick={investigatePayment}
    loading={loading}
/>
        </div>
      </section>
    <section className="summary-cards">
    <SummaryCard title="Total Transactions" value={stats.total} />
    <SummaryCard title="Successful" value={stats.successful} />
    <SummaryCard title="Failed" value={stats.failed} />
    </section>
    
    
<section className="transactions-section">
    <h2>Recent Transactions</h2>
        
<div className="transaction-filters">
    <input
        type="text"
        placeholder="Search transaction ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />

    <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
    >
        <option value="ALL">All statuses</option>
        <option value="SUCCESS">Success</option>
        <option value="FAILED">Failed</option>
        <option value="PENDING">Pending</option>
    </select>
</div>

    {loading ? (
        <p>Loading transactions...</p>
    ) : error ? (
        <p className="error-message">{error}</p>
    ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
    ) : (
        <div className="transactions-table-wrapper">
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>Transaction ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Debit Status</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedTransactions.map(transaction => (
                        <tr key={transaction.transactionId}>
                            <td>{transaction.transactionId}</td>
                            <td>
                                {Number(transaction.amount).toLocaleString(
                                    "en-IN",
                                    { style: "currency", currency: "INR" }
                                )}
                            </td>
                            <td>
    <span className={`status-badge ${transaction.status?.toLowerCase()}`}>
        {transaction.status}
    </span>
</td>
                            <td>{transaction.accountDebitStatus}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
<div className="pagination">
    <span>
        Page {currentPage} of {totalPages}
    </span>

    <div>
        <button
            onClick={() => setCurrentPage(page => page - 1)}
            disabled={currentPage === 1}
        >
            Previous
        </button>

        <button
            onClick={() => setCurrentPage(page => page + 1)}
            disabled={currentPage === totalPages}
        >
            Next
        </button>
    </div>
</div>

        </div>
    )}
</section>
      
      {result && (
        <section className="result-card">
          <h2>Investigation Results</h2>

          {riskLevel && (
            <span
              className={`risk-badge ${riskLevel.toLowerCase().replaceAll(' ', '-')}`}
            >
              {riskLevel}
            </span>
          )}

          <ReactMarkdown>{result}</ReactMarkdown>
        </section>
      )}
    </main>
  );
}

