import React from "react";

export default function FileUpload({ onFileLoaded, disabled }) {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowed = /\.(txt|log|json|csv)$/i;
        if (!allowed.test(file.name)) {
            alert("Only .txt, .log, .json, .csv files allowed.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert("File too large (max 2MB).");
            return;
        }
        file.text().then((text) => {
            onFileLoaded({ file, content: text });
        });
    };

    return (
        <label className="inline-flex items-center cursor-pointer">
            <input
                type="file"
                accept=".txt,.log,.json,.csv"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled}
            />
            <span className="px-3 py-2 bg-gray-800 text-gray-100 rounded hover:bg-gray-700 transition text-sm font-medium">
                Upload Log
            </span>
        </label>
    );
}
