// HistoricalA.tsx
import React from "react";

interface HistoricalAProps {
  historyData: any | null;
}

const HistoricalA: React.FC<HistoricalAProps> = ({ historyData }) => {
  // Safely extract values
  const stripYear = (dateStr: string) => {
    if (!dateStr || dateStr === "-") return "-";
    const parts = dateStr.split("-");
    return parts.length === 3 ? `${parts[1]}-${parts[2]}` : dateStr;
  };
  const avg_BOS_ = historyData?.avg_BOS || "-";
  const avg_MOS_ = historyData?.avg_MOS || "-";
  const avg_EOS_ = historyData?.avg_EOS || "-";
  const avg_Length_of_Season = historyData?.avg_Length_of_Season || "-";

  const avg_SOB_ = historyData?.avg_SOB || "-";
  const avg_POB_ = historyData?.avg_POB || "-";
  const avg_EOB_ = historyData?.avg_EOB || "-";
  const avg_Length_of_Bloom = historyData?.avg_Length_of_Bloom || "-";

  const avg_BOS = stripYear(avg_BOS_);
  const avg_MOS = stripYear(avg_MOS_);
  const avg_EOS = stripYear(avg_EOS_);

  const avg_SOB = stripYear(avg_SOB_);
  const avg_POB = stripYear(avg_POB_);
  const avg_EOB = stripYear(avg_EOB_);

  const avg_Land_Fertility_Score =
    historyData?.avg_Land_Fertility_Score !== undefined
      ? historyData.avg_Land_Fertility_Score
      : "-";
  const avg_Yield_Production =
    historyData?.avg_Yield_Production !== undefined
      ? historyData.avg_Yield_Production
      : "-";
  const avg_Maximum_Value =
    historyData?.avg_Maximum_Value !== undefined
      ? historyData.avg_Maximum_Value.toFixed(4)
      : "-";
  const non_Blooming_Years =
    historyData?.non_Blooming_Years !== undefined
      ? historyData.non_Blooming_Years
      : "-";
  const invasive_Species_Probability =
    historyData?.invasive_Species_Probability !== undefined
      ? historyData.invasive_Species_Probability
      : "-";

  const rows = [
    ["Average Beginning of Season BOS:", avg_BOS + " (MM-DD)"],
    ["Average Middle of Season MOS:", avg_MOS + " (MM-DD)"],
    ["Average End of Season EOS:", avg_EOS + " (MM-DD)"],
    ["Average Length of Season/days:", avg_Length_of_Season],
    ["Average Start of Bloom SOB:", avg_SOB + " (MM-DD)"],
    ["Average Peak of Bloom POB:", avg_POB + " (MM-DD)"],
    ["Average End of Bloom EOB:", avg_EOB + " (MM-DD)"],
    ["Average Length of Bloom/days:", avg_Length_of_Bloom],
    ["Average Land Fertility Score (1-100):", avg_Land_Fertility_Score * 100],
    ["Average Yield Production:", avg_Yield_Production + " kg/ha"],
    ["Average Maximum Value/NDVI:", avg_Maximum_Value],
    ["Non-Blooming Years:", non_Blooming_Years],
    ["Invasive Species Probability %:", invasive_Species_Probability * 100],
  ];

  return (
    <div className="overflow-x-auto">
      {!historyData && (
        <div className="text-center text-gray-700 font-mono mb-3">
          No historical data available yet
        </div>
      )}
      <table className="min-w-full border border-gray-300 rounded-lg shadow-md font-mono text-black">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 border-b font-semibold text-left rounded-tl-lg">
              Sr No.
            </th>
            <th className="p-3 border-b font-semibold text-center">
              Parameter
            </th>
            <th className="p-3 border-b font-semibold text-center rounded-tr-lg">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([param, value], idx) => (
            <tr
              key={idx}
              className={
                idx % 2 === 0 ? "bg-white text-left" : "bg-gray-50 text-left"
              }
            >
              <td className="p-3 border-b">{idx + 1}</td>
              <td className="p-3 border-b">{param}</td>
              <td className="p-3 border-b">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoricalA;
