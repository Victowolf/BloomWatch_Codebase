import React from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface EcologicalAProps {
  ecologicalData: {
    phenology: {
      bloom_shift_days: number;
      bloom_duration_days: number;
    };
    vegetation: {
      ecosystem_productivity_index: number;
    };
    climate_phenology: {
      temperature_impact: string;
      precipitation_impact: string;
      extreme_event_risk: string;
      predicted_shift_days: number;
    };
    ecological_indicators: {
      pollen_index: number;
      pollinator_support_index: number;
      invasive_species_risk: number;
      phenological_synchrony_score: number;
      ecosystem_resilience_score: number;
    };
    summary: string;
  } | null;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"];

const EcologicalA: React.FC<EcologicalAProps> = ({ ecologicalData }) => {
  if (!ecologicalData) {
    return (
      <div className="text-muted-foreground font-mono text-center">
        No ecological data available.
      </div>
    );
  }

  const {
    phenology,
    vegetation,
    climate_phenology,
    ecological_indicators,
    summary,
  } = ecologicalData;

  const sectionClass =
    "mb-4 p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col";

  // Data for charts
  const lineData = [
    { name: "Bloom Shift", Days: phenology.bloom_shift_days },
    { name: "Bloom Duration", Days: phenology.bloom_duration_days },
    { name: "Predicted Shift", Days: climate_phenology.predicted_shift_days },
  ];

  const pieData = [
    {
      name: "Temperature",
      value:
        ["Low", "Moderate", "High"].indexOf(
          climate_phenology.temperature_impact
        ) + 1,
    },
    {
      name: "Precipitation",
      value:
        ["Low", "Moderate", "High"].indexOf(
          climate_phenology.precipitation_impact
        ) + 1,
    },
    {
      name: "Extreme Event Risk",
      value:
        ["Low", "Moderate", "High"].indexOf(
          climate_phenology.extreme_event_risk
        ) + 1,
    },
  ];

  const barData = [
    { name: "Pollen", Index: ecological_indicators.pollen_index },
    {
      name: "Pollinator",
      Index: ecological_indicators.pollinator_support_index,
    },
    {
      name: "Invasive Risk",
      index: ecological_indicators.invasive_species_risk,
    },
    {
      name: "Synchrony",
      Index: ecological_indicators.phenological_synchrony_score,
    },
    {
      name: "Resilience",
      Index: ecological_indicators.ecosystem_resilience_score,
    },
  ];

  return (
    <div className="flex flex-col gap-4 font-mono text-gray-800">
      {/* Row 1: Phenology + Vegetation */}
      <div className="flex gap-4">
        <div className={`${sectionClass} w-1/2`}>
          <h4 className="font-bold text-lg text-center mb-2">Phenology</h4>
          <p className="text-left">
            <strong>Bloom Shift Days:</strong> {phenology.bloom_shift_days}
          </p>
          <p className="text-left">
            <strong>Bloom Duration Days:</strong>{" "}
            {phenology.bloom_duration_days}
          </p>
        </div>

        <div className={`${sectionClass} w-1/2`}>
          <h4 className="font-bold text-lg text-center mb-2">Vegetation</h4>
          <p className="text-left">
            <strong>Ecosystem Productivity Index:</strong>{" "}
            {vegetation.ecosystem_productivity_index.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Row 2: Climate-Phenology + Ecological Indicators */}
      <div className="flex gap-4">
        <div className={`${sectionClass} w-1/2`}>
          <h4 className="font-bold text-lg text-center mb-2">
            Climate-Phenology
          </h4>
          <p className="text-left">
            <strong>Temperature Impact:</strong>{" "}
            {climate_phenology.temperature_impact}
          </p>
          <p className="text-left">
            <strong>Precipitation Impact:</strong>{" "}
            {climate_phenology.precipitation_impact}
          </p>
          <p className="text-left">
            <strong>Extreme Event Risk:</strong>{" "}
            {climate_phenology.extreme_event_risk}
          </p>
          <p className="text-left">
            <strong>Predicted Shift Days:</strong>{" "}
            {climate_phenology.predicted_shift_days}
          </p>
        </div>

        <div className={`${sectionClass} w-1/2`}>
          <h4 className="font-bold text-lg text-center mb-2">
            Ecological Indicators
          </h4>
          <p className="text-left">
            <strong>Pollen Index:</strong>{" "}
            {ecological_indicators.pollen_index.toFixed(2)}
          </p>
          <p className="text-left">
            <strong>Pollinator Support Index:</strong>{" "}
            {ecological_indicators.pollinator_support_index.toFixed(2)}
          </p>
          <p className="text-left">
            <strong>Invasive Species Risk:</strong>{" "}
            {ecological_indicators.invasive_species_risk.toFixed(2)}
          </p>
          <p className="text-left">
            <strong>Phenological Synchrony Score:</strong>{" "}
            {ecological_indicators.phenological_synchrony_score.toFixed(2)}
          </p>
          <p className="text-left">
            <strong>Ecosystem Resilience Score:</strong>{" "}
            {ecological_indicators.ecosystem_resilience_score.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Row 3: Summary + Charts */}
      <div className="flex gap-4">
        <div className={`${sectionClass} w-1/2`}>
          <h4 className="font-bold text-lg text-center mb-2">Summary</h4>
          <p className="text-left">{summary}</p>
        </div>

        <div className={`${sectionClass} w-1/2 gap-4`}>
          {/* Line Chart */}
          <div
            className="bg-white rounded p-2 border border-gray-200"
            style={{ height: "150px" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Days" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div
            className="bg-white rounded p-2 border border-gray-200"
            style={{ height: "200px" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={50}
                  fill="#82ca9d"
                  label={({ name }) => name}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div
            className="bg-white rounded p-2 border border-gray-200"
            style={{ height: "150px" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Index" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcologicalA;
