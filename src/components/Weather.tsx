import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CloudRain, Sun, Cloud, CloudLightning } from "lucide-react";

interface DayData {
  day: string;
  temp: string;
  icon: string;
}

interface MonthData {
  name: string;
  avg: string;
  rainy: number;
  sunny: number;
  wind: string;
  icon: string;
}

interface CurrentData {
  temperature: string;
  feels_like: string;
  condition: string;
  icon: string;
  precipitation: number;
  humidity: number;
  wind: string;
  air_quality: string;
}

interface WeatherProps {
  weatherData: {
    current: CurrentData;
    week: DayData[];
    months: MonthData[];
  };
}

const iconMap: Record<string, JSX.Element> = {
  Sun: <Sun className="w-6 h-6 text-yellow-400" />,
  Cloud: <Cloud className="w-6 h-6 text-gray-300" />,
  CloudRain: <CloudRain className="w-6 h-6 text-blue-400" />,
  CloudLightning: <CloudLightning className="w-6 h-6 text-purple-400" />,
};

const Weather: React.FC<WeatherProps> = ({ weatherData }) => {
  const { current, week, months } = weatherData;

  return (
    <div
      className="bg-white rounded shadow items-center justify-center"
      style={{ maxHeight: "1000px", maxWidth: "600px" }}
    >
      <div className="w-full H-[10px] max-w-3xl p-1">
        <Card className="bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-2 text-white">
            {/* Header / Current Weather */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold">{current.temperature}</h2>
                <p className="text-gray-300">Feels like {current.feels_like}</p>
                <p className="text-sm text-blue-400">{current.condition}</p>
              </div>
              <div>
                {iconMap[current.icon] || <Sun className="w-12 h-12" />}
              </div>
            </div>

            {/* Weather Stats */}
            <div className="grid grid-cols-2 text-sm text-gray-300 mb-6">
              <p>
                Precipitation:{" "}
                <span className="text-white">{current.precipitation}%</span>
              </p>
              <p>
                Humidity:{" "}
                <span className="text-white">{current.humidity}%</span>
              </p>
              <p>
                Wind: <span className="text-white">{current.wind}</span>
              </p>
              <p>
                Air Quality:{" "}
                <span
                  className={`${
                    current.air_quality === "Good"
                      ? "text-green-400"
                      : current.air_quality === "Moderate"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {current.air_quality}
                </span>
              </p>
            </div>

            {/* Overview Tab */}
            <div className="flex justify-center mb-4">
              <button className="text-white border-b-2 border-blue-400 pb-1 px-4">
                Overview
              </button>
            </div>

            {/* Week Row */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-white">
                This Week
              </h3>
              <div className="grid grid-cols-7 gap-2 text-center">
                {week.map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center bg-gray-700 rounded-xl py-3"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {iconMap[item.icon] || <Sun className="w-6 h-6" />}
                    </div>
                    <p className="text-sm mt-1">{item.day}</p>
                    <p className="text-xs text-gray-300">{item.temp}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Months - side-by-side row */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-white">Months</h3>
              <div className="flex gap-4 overflow-x-auto py-2 items-stretch">
                {months.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex-shrink-0 w-56 bg-gray-700 rounded-2xl p-4 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        {iconMap[m.icon] || <Sun />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{m.name}</p>
                        <p className="text-xs text-gray-300">
                          Avg Temp • {m.avg}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between text-center">
                      <div>
                        <p className="text-xs text-gray-300">Rainy</p>
                        <p className="font-semibold text-white">{m.rainy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">Sunny</p>
                        <p className="font-semibold text-white">{m.sunny}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-300">Wind</p>
                        <p className="font-semibold text-white">{m.wind}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Weather;
