'use client';

import { useState, ChangeEvent } from "react";
import { UploadCloud, DownloadCloud, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [corruptedFile, setCorruptedFile] = useState<File | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    // Accept .docx only (Word XML format)
    if (uploaded.name.toLowerCase().endsWith(".docx")) {
      setFile(uploaded);
      setCorruptedFile(null);
    } else {
      alert("Please upload a .docx Word file.");
    }
  };

  const corruptFile = async () => {
    if (!file) return;
    setIsWorking(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buf = new Uint8Array(arrayBuffer);

      // Simple corruption algorithm:
      // We'll corrupt between 0.5% - 1.5% of bytes randomly.
      const pct = 0.005 + Math.random() * 0.01;
      const corruptCount = Math.max(1, Math.floor(buf.length * pct));

      // Make a copy
      const corrupted = new Uint8Array(buf);

      for (let i = 0; i < corruptCount; i++) {
        const idx = Math.floor(Math.random() * corrupted.length);
        // flip some bits or randomize byte
        corrupted[idx] = (corrupted[idx] ^ (1 << (Math.floor(Math.random() * 8)))) & 0xff;
      }

      const blob = new Blob([corrupted], {
        type:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const outFile = new File([blob], file.name.replace(/\.docx$/i, "_corrupted.docx"), {
        type: blob.type,
      });

      setCorruptedFile(outFile);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while corrupting the file.");
    } finally {
      setIsWorking(false);
    }
  };

  const downloadFile = () => {
    if (!corruptedFile) return;
    const url = URL.createObjectURL(corruptedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = corruptedFile.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-pink-400"
        >
          Word File Corruptor ⚡
        </motion.h1>

        <p className="mt-4 text-sm text-gray-300">
          Upload a <strong>.docx</strong> file, corrupt it, and download the broken version.
        </p>

        <div className="mt-8 bg-gray-900/60 border border-gray-700 rounded-2xl p-6 shadow-lg">
          <label className="cursor-pointer flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-700 rounded-lg hover:border-indigo-500 transition">
            <UploadCloud className="w-10 h-10 text-indigo-400" />
            <div className="text-gray-300">Click to upload a .docx file</div>
            <input
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {file && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-300" />
                <div>
                  <div className="font-medium truncate" style={{ maxWidth: 260 }}>
                    {file.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={corruptFile}
                  disabled={isWorking}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-md text-white"
                >
                  {isWorking ? "Corrupting..." : "Corrupt File"}
                </button>
                {corruptedFile && (
                  <button
                    onClick={downloadFile}
                    className="px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded-md text-white flex items-center gap-2"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Note: Corruption may make the file completely unreadable. Use copies only.
        </p>
      </div>
    </main>
  );
}
