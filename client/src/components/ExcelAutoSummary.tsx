import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const ExcelAutoSummary = ({ fileName }: { fileName: string }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        const response = await fetch(`/excels/${fileName}`);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

        generateAISummary(sheetData);
      } catch (err) {
        console.error("Error reading Excel:", err);
        setSummary("Error reading file");
        setLoading(false);
      }
    };

    fetchExcel();
  }, [fileName]);

  const generateAISummary = async (data: any) => {
    const prompt = `
You are a project analyst. Summarize this project Excel sheet data using the format:

1. 🔍 Current Update Summary
2. 🗂️ Tasks Identified
3. 🚧 Key Issues / Challenges
4. ✅ Mitigation & “Path to Green” Plan
5. 🔁 Next Steps for Project Team

Data:
${JSON.stringify(data, null, 2)}
    `;

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openchat/openchat-3.5", // You can change model here
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSummary(response.data.choices[0].message.content);
    } catch (error) {
      console.error("Error from OpenRouter:", error);
      setSummary("Error generating summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-lg">📊 Project Summary for: {fileName}</h2>
      {loading ? <p>⏳ Generating summary...</p> : <pre>{summary}</pre>}
    </div>
  );
};

export default ExcelAutoSummary;
