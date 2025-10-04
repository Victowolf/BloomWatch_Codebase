// NutrientA.tsx
import React from "react";

interface NutrientAProps {
  nutrientData: any | null;
}

const NutrientA: React.FC<NutrientAProps> = ({ nutrientData }) => {
  // Define nutrient rows
  const rows = [
    [
      "Iron (Fe)",
      nutrientData?.["Iron (Fe)"] ? `${nutrientData["Iron (Fe)"]} mg/m²` : "-",
    ],
    [
      "Zinc (Zn)",
      nutrientData?.["Zinc (Zn)"] ? `${nutrientData["Zinc (Zn)"]} mg/m²` : "-",
    ],
    [
      "Copper (Cu)",
      nutrientData?.["Copper (Cu)"]
        ? `${nutrientData["Copper (Cu)"]} mg/m²`
        : "-",
    ],
    [
      "Phosphorus (P)",
      nutrientData?.["Phosphorus (P)"]
        ? `${nutrientData["Phosphorus (P)"]} mg/m²`
        : "-",
    ],
    [
      "Nitrates (N)",
      nutrientData?.["Nitrates (N)"]
        ? `${nutrientData["Nitrates (N)"]} mg/m²`
        : "-",
    ],
  ];

  return (
    <div className="overflow-x-auto">
      {!nutrientData && (
        <div className="text-center text-gray-700 font-mono mb-3">
          No nutrient data available yet
        </div>
      )}
      <table className="min-w-full border border-gray-300 rounded-lg shadow-md font-mono text-black">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3 border-b font-semibold text-left rounded-tl-lg">
              Sr No.
            </th>
            <th className="p-3 border-b font-semibold text-center">Nutrient</th>
            <th className="p-3 border-b font-semibold text-center rounded-tr-lg">
              Concentration
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
              <td className="p-3 border-b text-center">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NutrientA;
