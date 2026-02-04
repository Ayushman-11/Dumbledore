import React, { useState } from 'react';
import './CVEExplorer.css';

export default function CVEExplorer({ onAnalyzeWithAI, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [cves, setCves] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const searchCVEs = async () => {
        if (!searchQuery.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError('');
        setCves([]);

        try {
            const response = await fetch(
                `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(searchQuery)}&resultsPerPage=10`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch CVE data');
            }

            const data = await response.json();

            if (data.vulnerabilities && data.vulnerabilities.length > 0) {
                const formattedCVEs = data.vulnerabilities.map(item => {
                    const cve = item.cve;
                    const metrics = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV2?.[0];
                    const severity = metrics?.cvssData?.baseSeverity ||
                        metrics?.baseSeverity ||
                        'UNKNOWN';
                    const score = metrics?.cvssData?.baseScore ||
                        metrics?.cvssData?.score ||
                        'N/A';

                    return {
                        id: cve.id,
                        description: cve.descriptions?.find(d => d.lang === 'en')?.value || 'No description available',
                        severity: severity,
                        score: score,
                        published: cve.published,
                        references: cve.references?.slice(0, 3) || []
                    };
                });
                setCves(formattedCVEs);
            } else {
                setError('No CVEs found for this search');
            }
        } catch (err) {
            setError(err.message || 'Failed to search CVEs');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            'CRITICAL': '#dc2626',
            'HIGH': '#ea580c',
            'MEDIUM': '#f59e0b',
            'LOW': '#10b981',
            'UNKNOWN': '#6b7280'
        };
        return colors[severity] || colors['UNKNOWN'];
    };

    const handleAnalyze = (cve) => {
        const analysisPrompt = `**CVE Analysis Request: ${cve.id}**\n\n**Severity:** ${cve.severity} (Score: ${cve.score})\n**Description:** ${cve.description}\n\nProvide a concise analysis covering:\n• Exploitation techniques and attack vectors\n• Mitigation strategies and patches\n• Real-world impact and affected systems\n• Detection and prevention methods\n\nKeep response structured and avoid excessive spacing.`;

        if (onAnalyzeWithAI) {
            onAnalyzeWithAI(analysisPrompt, cve.id);
            if (onClose) onClose();
        }
    };

    return (
        <div className="cve-explorer-overlay">
            <div className="cve-explorer">
                <div className="cve-header">
                    <h2>
                        <svg style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }} width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        CVE Explorer
                    </h2>
                    <button className="cve-close" onClick={onClose}>×</button>
                </div>

                <div className="cve-search-bar">
                    <input
                        type="text"
                        placeholder="Search CVEs (e.g., SQL injection, Apache, Windows)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchCVEs()}
                        disabled={loading}
                    />
                    <button onClick={searchCVEs} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {error && <div className="cve-error">{error}</div>}

                <div className="cve-results">
                    {cves.map((cve) => (
                        <div key={cve.id} className="cve-card">
                            <div className="cve-card-header">
                                <h3>{cve.id}</h3>
                                <span
                                    className="cve-severity-badge"
                                    style={{ background: getSeverityColor(cve.severity) }}
                                >
                                    {cve.severity} ({cve.score})
                                </span>
                            </div>
                            <p className="cve-description">{cve.description}</p>
                            <div className="cve-meta">
                                <span>📅 {new Date(cve.published).toLocaleDateString()}</span>
                            </div>
                            {cve.references.length > 0 && (
                                <div className="cve-references">
                                    <strong>References:</strong>
                                    {cve.references.map((ref, idx) => (
                                        <a
                                            key={idx}
                                            href={ref.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cve-ref-link"
                                        >
                                            {ref.url.length > 50 ? ref.url.slice(0, 47) + '...' : ref.url}
                                        </a>
                                    ))}
                                </div>
                            )}
                            <button
                                className="cve-analyze-btn"
                                onClick={() => handleAnalyze(cve)}
                            >
                                Ask AI to Analyze
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
