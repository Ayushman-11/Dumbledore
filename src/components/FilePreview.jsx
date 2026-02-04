import React from "react";

export default function FilePreview({ file, content, onAnalyze, analyzing }) {
    if (!file) return null;
    const lines = content.split(/\r?\n/).slice(0, 500);
    const preview = lines.join("\n");
    return (
        <div className="bg-gray-900 rounded-lg p-4 mt-4 shadow-md">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <span className="font-semibold text-gray-200">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                </div>
                <button
                    className="px-3 py-1 bg-blue-700 text-white rounded hover:bg-blue-600 text-xs font-semibold"
                    onClick={onAnalyze}
                    disabled={analyzing}
                >
                    {analyzing ? "Analyzing..." : "Analyze with AI"}
                </button>
            </div>
            <div className="overflow-auto max-h-64 bg-black rounded p-2 text-xs font-mono text-gray-200 border border-gray-800">
                {preview}
                {lines.length === 500 && (
                    <div className="text-gray-500 mt-2">...truncated preview</div>
                )}
            </div>
        </div>
    );
}
