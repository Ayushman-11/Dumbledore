import React, { useState } from "react";
import FileUpload from "./FileUpload";
import FilePreview from "./FilePreview";
import AnalysisResult from "./AnalysisResult";
import { sendMessage } from "../utils/api";

const SYSTEM_PROMPT = `You are a professional cybersecurity SOC analyst and penetration tester.
Analyze the uploaded log file.
Detect suspicious activity, attacks, anomalies, vulnerabilities.
Explain clearly.
Provide:
1. Summary
2. Findings
3. Risk Level (Low/Medium/High)
4. Recommendations`;

function parseAIResponse(text) {
    // Try to extract sections using regex or simple parsing
    // Fallback: treat as plain text
    const summary = /Summary[:\n]*([\s\S]*?)(?:Findings:|$)/i.exec(text)?.[1]?.trim() || "";
    const findingsBlock = /Findings[:\n]*([\s\S]*?)(?:Risk Level:|$)/i.exec(text)?.[1] || "";
    const findings = findingsBlock
        .split(/\n|•|- /)
        .map((l) => l.replace(/^[\s•-]+/, "").trim())
        .filter((l) => l.length > 2);
    const riskLevel = /Risk Level[:\n]*([A-Za-z]+)/i.exec(text)?.[1]?.trim() || "Unknown";
    const recBlock = /Recommendations[:\n]*([\s\S]*)/i.exec(text)?.[1] || "";
    const recommendations = recBlock
        .split(/\n|•|- /)
        .map((l) => l.replace(/^[\s•-]+/, "").trim())
        .filter((l) => l.length > 2);
    return { summary, findings, riskLevel, recommendations };
}

export default function FileAnalyzer() {
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);

    const handleFileLoaded = ({ file, content }) => {
        setFile(file);
        setFileContent(content);
        setAnalysisResult(null);
        setError("");
    };

    const handleAnalyze = async () => {
        setAnalyzing(true);
        setError("");
        setAnalysisResult(null);
        try {
            const userMsg = `Filename: ${file.name}\n\n${fileContent.slice(0, 12000)}`;
            const aiText = await sendMessage([], userMsg, undefined, undefined, SYSTEM_PROMPT);
            const parsed = parseAIResponse(aiText);
            setAnalysisResult(parsed);
        } catch (e) {
            setError(e.message || "Analysis failed.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleQuickAction = async (action) => {
        if (!analysisResult) return;
        setAnalyzing(true);
        setError("");
        try {
            let persona, prompt, userMsg;
            if (action === "dumbledore") {
                persona = "dumbledore";
                prompt = "Explain these findings from a defensive (blue team) perspective.";
            } else if (action === "snape") {
                persona = "snape";
                prompt = "Explain these findings from an offensive (red team) perspective.";
            } else if (action === "report") {
                prompt = "Generate a professional incident report for these findings.";
            }
            userMsg = `\nLog Analysis Results:\nSummary: ${analysisResult.summary}\nFindings: ${analysisResult.findings.join("; ")}\nRisk Level: ${analysisResult.riskLevel}\nRecommendations: ${analysisResult.recommendations.join("; ")}`;
            const aiText = await sendMessage([], userMsg, undefined, persona, prompt);
            alert(aiText);
        } catch (e) {
            setError(e.message || "Action failed.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleExport = () => {
        setExporting(true);
        try {
            const text = `\nLog Analysis Report\n===================\nFile: ${file?.name || ""}\nSummary: ${analysisResult?.summary || ""}\nFindings:\n${(analysisResult?.findings || []).map((f) => "- " + f).join("\n")}\nRisk Level: ${analysisResult?.riskLevel || ""}\nRecommendations:\n${(analysisResult?.recommendations || []).map((r) => "- " + r).join("\n")}`;
            const blob = new Blob([text], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${file?.name || "log"}-analysis.txt`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-gray-950 p-6 rounded-xl shadow-lg max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">File Upload + Log Analysis</h2>
            <FileUpload onFileLoaded={handleFileLoaded} disabled={analyzing} />
            {file && (
                <FilePreview
                    file={file}
                    content={fileContent}
                    onAnalyze={handleAnalyze}
                    analyzing={analyzing}
                />
            )}
            {error && (
                <div className="mt-4 text-red-400 bg-gray-900 rounded p-2">{error}</div>
            )}
            <AnalysisResult
                result={analysisResult}
                onQuickAction={handleQuickAction}
                onExport={handleExport}
                exporting={exporting}
            />
        </div>
    );
}
