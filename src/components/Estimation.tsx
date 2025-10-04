// GrowthA.tsx
import React from "react";

interface estimationProps {
  growthData: any | null;
}

const estimation: React.FC<estimationProps> = ({ growthData }) => {
  // Safely extract values
  const vegetationGrowth =
    growthData?.vegetation_growth_percentage !== undefined
      ? growthData.vegetation_growth_percentage
      : "-";
  const yieldProduction =
    growthData?.yield_production !== undefined
      ? growthData.yield_production
      : "-";
  const pollenProduction =
    growthData?.pollen_production !== undefined
      ? growthData.pollen_production
      : "-";
  const bloomDate =
    growthData?.bloom_date !== undefined ? growthData.bloom_date : "-";

  const rows = [
    ["Vegetation Growth %", vegetationGrowth],
    ["Yield Production (kg/ha)", yieldProduction],
    ["Pollen Production (kg/ha)", pollenProduction],
    ["Next year bloom date (YYYY-MM-DD)", bloomDate],
  ];

  return (
    <div className="overflow-x-auto">
      {!growthData && (
        <div className="text-center text-gray-700 font-mono mb-3">
          No growth data available yet
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

export default estimation;
