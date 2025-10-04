// SeasonA.tsx
import React from "react";

interface SeasonAProps {
  seasonAnalysis: any | null;
}

const SeasonA: React.FC<SeasonAProps> = ({ seasonAnalysis }) => {
  // Safely extract values
  const BOS = seasonAnalysis?.BOS?.date || "-";
  const MOS = seasonAnalysis?.MOS?.date || "-";
  const EOS = seasonAnalysis?.EOS?.date || "-";
  const seasonLength = seasonAnalysis?.Length_of_Season?.days || "-";

  const SOB = seasonAnalysis?.SOB?.date || "-";
  const POB = seasonAnalysis?.POB?.date || "-";
  const EOB = seasonAnalysis?.EOB?.date || "-";
  const bloomLength = seasonAnalysis?.Length_of_Bloom?.days || "-";

  const baseValue =
    seasonAnalysis?.Base_Value?.ndvi !== undefined
      ? seasonAnalysis.Base_Value.ndvi.toFixed(4)
      : "-";
  const maxValue =
    seasonAnalysis?.Maximum_Value?.ndvi !== undefined
      ? seasonAnalysis.Maximum_Value.ndvi.toFixed(4)
      : "-";
  const FertilityScore =
    seasonAnalysis?.Maximum_Value?.ndvi !== undefined
      ? seasonAnalysis.Fertlity_Score.score.toFixed(4)
      : "-";
  const amplitude =
    seasonAnalysis?.Amplitude?.ndvi !== undefined
      ? seasonAnalysis.Amplitude.ndvi.toFixed(4)
      : "-";
  const noBloom =
    seasonAnalysis?.NO_BLOOM?.probability !== undefined
      ? seasonAnalysis.NO_BLOOM.probability
      : "-";

  const rows = [
    ["Beginning of season BOS: ", BOS],
    ["Middle of season MOS: ", MOS],
    ["End of season EOS: ", EOS],
    ["Length of season/days:", seasonLength],
    ["Start of bloom SOB:", SOB],
    ["Peak of bloom POB:", POB],
    ["End of bloom EOB:", EOB],
    ["Length of bloom/days:", bloomLength],
    ["Land Fertility Score (1-100):", FertilityScore * 100],
    ["Base value/NDVI:", baseValue],
    ["Maximum value/NDVI:", maxValue],
    ["Amplitude/NDVI:", amplitude],
    ["No Bloom %:", noBloom],
  ];

  return (
    <div className="overflow-x-auto">
      {!seasonAnalysis && (
        <div className="text-center text-gray-700 font-mono mb-3">
          No analysis data available yet
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
              Detection / Prediction
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

export default SeasonA;
