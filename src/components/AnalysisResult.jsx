import React from "react";

const badgeColors = {
    Low: "bg-green-700",
    Medium: "bg-yellow-600",
    High: "bg-red-700",
};

export default function AnalysisResult({
    result,
    onQuickAction,
    onExport,
    exporting,
}) {
    if (!result) return null;
    const { summary, findings, riskLevel, recommendations } = result;

    return (
        <div className="mt-6 space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 shadow">
                <h3 className="text-lg font-bold text-blue-300 mb-2">Summary</h3>
                <div className="text-gray-200">{summary}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 shadow">
                <h3 className="text-lg font-bold text-blue-300 mb-2">Findings</h3>
                <ul className="list-disc pl-6 text-gray-200 space-y-1">
                    {findings.map((f, i) => (
                        <li key={i}>{f}</li>
                    ))}
                </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 shadow flex items-center">
                <h3 className="text-lg font-bold text-blue-300 mr-4">Risk Level</h3>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white ${badgeColors[riskLevel] || "bg-gray-700"}`}
                >
                    {riskLevel}
                </span>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 shadow">
                <h3 className="text-lg font-bold text-blue-300 mb-2">Recommendations</h3>
                <ul className="list-disc pl-6 text-gray-200 space-y-1">
                    {recommendations.map((r, i) => (
                        <li key={i}>{r}</li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                <button
                    className="px-3 py-1 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 text-xs"
                    onClick={() => onQuickAction("report")}
                >
                    Generate Report
                </button>
                <button
                    className="px-3 py-1 bg-blue-800 text-white rounded hover:bg-blue-700 text-xs"
                    onClick={() => onQuickAction("dumbledore")}
                >
                    Ask Dumbledore
                </button>
                <button
                    className="px-3 py-1 bg-purple-800 text-white rounded hover:bg-purple-700 text-xs"
                    onClick={() => onQuickAction("snape")}
                >
                    Ask Snape
                </button>
                <button
                    className="px-3 py-1 bg-green-800 text-white rounded hover:bg-green-700 text-xs"
                    onClick={onExport}
                    disabled={exporting}
                >
                    {exporting ? "Exporting..." : "Export as Text"}
                </button>
            </div>
        </div>
    );
}
