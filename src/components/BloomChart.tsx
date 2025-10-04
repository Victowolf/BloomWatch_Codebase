// BloomChart.tsx
import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { FiMaximize } from "react-icons/fi";

interface BloomChartProps {
  data: any[];
  paramKeys: string[];
  eventTags: string[];
  colors: string[];
}

const BloomChart: React.FC<BloomChartProps> = ({
  data,
  paramKeys,
  eventTags,
  colors,
}) => {
  const [visibleParams, setVisibleParams] = useState(
    paramKeys.includes("NDVI") ? ["NDVI"] : []
  );
  const [visibleEvents, setVisibleEvents] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleParam = (param: string) => {
    setVisibleParams((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  };

  const toggleEvent = (event: string) => {
    setVisibleEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  // Normalize data between 1-100
  const normalizedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const result = data.map((row) => ({ ...row }));
    paramKeys.forEach((key) => {
      const values = data.map((d) => parseFloat(d[key]) || 0);
      const min = Math.min(...values);
      const max = Math.max(...values);
      result.forEach((row, idx) => {
        row[key] =
          max - min === 0 ? 50 : ((values[idx] - min) / (max - min)) * 99 + 1;
      });
    });
    return result;
  }, [data, paramKeys]);

  // Format date to "Mon-day" for X-axis
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[d.getMonth()]}-${d.getDate()}`;
  };

  return (
    <div
      className="flex flex-col w-full bg-white relative"
      style={{
        minHeight: "500px",
        maxHeight: "500px",
        minWidth: "500px",
        maxWidth: "700px",
      }}
    >
      {/* Expand Icon */}
      <button
        className="absolute top-2 right-2 text-black text-xl p-1 hover:bg-gray-200 rounded z-10"
        onClick={() => setIsExpanded(true)}
      >
        <FiMaximize />
      </button>

      {/* Chart Container */}
      <div
        className="w-full justify-center items-center py-[50px] bg-white rounded shadow flex-grow"
        style={{ minHeight: "400px", maxHeight: "400px" }}
      >
        <LineChart
          width={600}
          height={400}
          data={normalizedData}
          margin={{ top: 10, right: 30, left: 10, bottom: 50 }}
          style={{ backgroundColor: "#fff" }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis
            dataKey="Date"
            tickFormatter={formatDate}
            tick={{ fill: "black", fontSize: 12 }}
          />
          <YAxis tick={{ fill: "black", fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: "#fff", color: "#000" }} />
          <Legend wrapperStyle={{ color: "black" }} />

          {visibleParams.map((key, idx) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[idx % colors.length]}
              dot={false}
            />
          ))}

          {visibleEvents.includes("bloom_tag") &&
            normalizedData
              .filter((row) => row.bloom_tag)
              .map((row, idx) => (
                <ReferenceLine
                  key={`bloom-${idx}`}
                  x={row.Date}
                  stroke="red"
                  label={row.bloom_tag}
                />
              ))}

          {visibleEvents.includes("season_tag") &&
            normalizedData
              .filter((row) => row.season_tag)
              .map((row, idx) => (
                <ReferenceLine
                  key={`season-${idx}`}
                  x={row.Date}
                  stroke="blue"
                  label={row.season_tag}
                />
              ))}
        </LineChart>
      </div>

      {/* Checkboxes moved to bottom */}
      <div className="flex flex-wrap gap-1 mt-[20px] z-10 relative justify-center">
        {paramKeys.map((key) => (
          <label
            key={key}
            className="flex items-center gap-1 font-mono text-black"
          >
            <input
              type="checkbox"
              checked={visibleParams.includes(key)}
              onChange={() => toggleParam(key)}
            />
            {key}
          </label>
        ))}
        {eventTags.map((tag) => (
          <label
            key={tag}
            className="flex items-center gap-1 font-mono text-black"
          >
            <input
              type="checkbox"
              checked={visibleEvents.includes(tag)}
              onChange={() => toggleEvent(tag)}
            />
            {tag}
          </label>
        ))}
      </div>

      {/* Expanded Modal */}
      {isExpanded &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg w-[1000px] h-[800px] relative flex flex-col">
              {/* Close Button */}
              <button
                className="absolute top-2 right-2 text-black text-2xl"
                onClick={() => setIsExpanded(false)}
              >
                ✕
              </button>

              {/* Chart */}
              <div className="flex-grow flex justify-center items-center">
                <div>
                  {" "}
                  <p className="text-black text-xl">
                    <center>Vegetation graph</center>
                  </p>{" "}
                  <LineChart
                    width={950}
                    height={650}
                    data={normalizedData}
                    margin={{ top: 10, right: 30, left: 10, bottom: 50 }}
                    style={{ backgroundColor: "#fff" }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis
                      dataKey="Date"
                      tickFormatter={formatDate}
                      tick={{ fill: "black", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "black", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", color: "#000" }}
                    />
                    <Legend wrapperStyle={{ color: "black" }} />

                    {/* Lines */}
                    {visibleParams.map((key, idx) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={colors[idx % colors.length]}
                        dot={false}
                      />
                    ))}

                    {/* ReferenceLines for events */}
                    {visibleEvents.includes("bloom_tag") &&
                      normalizedData
                        .filter((row) => row.bloom_tag)
                        .map((row, idx) => (
                          <ReferenceLine
                            key={`bloom-${idx}`}
                            x={row.Date}
                            stroke="red"
                            label={row.bloom_tag}
                          />
                        ))}

                    {visibleEvents.includes("season_tag") &&
                      normalizedData
                        .filter((row) => row.season_tag)
                        .map((row, idx) => (
                          <ReferenceLine
                            key={`season-${idx}`}
                            x={row.Date}
                            stroke="blue"
                            label={row.season_tag}
                          />
                        ))}
                  </LineChart>
                </div>
              </div>

              {/* Checkboxes at bottom */}
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {/* Parameters */}
                {paramKeys.map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-1 font-mono text-black"
                  >
                    <input
                      type="checkbox"
                      checked={visibleParams.includes(key)}
                      onChange={() => toggleParam(key)}
                    />
                    {key}
                  </label>
                ))}

                {/* Events */}
                {["bloom_tag", "season_tag"].map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-1 font-mono text-black"
                  >
                    <input
                      type="checkbox"
                      checked={visibleEvents.includes(tag)}
                      onChange={() => toggleEvent(tag)}
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default BloomChart;
