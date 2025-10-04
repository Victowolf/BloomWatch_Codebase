import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Papa from "papaparse";
import BloomChart from "./BloomChart";
import SeasonA from "./SeasonA";
import HistoricalA from "./HistoricalA";
import Estimation from "./Estimation";
import NutrientA from "./NutrientA";
import EcologicalA from "./EcologicalA";

const Regionspecific = () => {
  const [countries, setCountries] = useState([]);
  const [counties, setCounties] = useState({});
  const [regions, setRegions] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState(null);
  const PARAM_KEYS = [
    "NDVI",
    "RCC",
    "YCC",
    "BCC",
    "ExG",
    "PAR",
    "NDWI",
    "LST_K",
  ];
  const EVENT_TAGS = ["bloom_tag", "season_tag"];
  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
  ];

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://victowolf-bloomwatch.hf.space/contents"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setCountries(data.countries || []);
        setCounties(data.counties || {});
        setRegions(data.regions || {});
        setError(null);
      } catch (err) {
        console.error("Failed to fetch contents:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, []);

  // State variables
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [chartData, setChartData] = useState([]);
  const [seasonAnalysis, setSeasonAnalysis] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [growthData, setGrowthData] = useState<any | null>(null);
  const [nutrientData, setNutrientData] = useState<any | null>(null);
  const [ecologicalData, setEcologicalData] = useState<any | null>(null);
  const [regionHistory, setRegionHistory] = useState(null);
  const [radius, setRadius] = useState("");
  const [Year, setYear] = useState("");
  const isFetchDisabled =
    !selectedCountry || !selectedCounty || !selectedRegion || !Year;

  // Event handlers
  const onCountryChange = (value) => {
    setSelectedCountry(value);
    setSelectedCounty("");
    setSelectedRegion("");
  };

  const onCountyChange = (value) => {
    setSelectedCounty(value);
    setSelectedRegion("");
  };

  const handle_fetch = async () => {
    if (isFetchDisabled) return;

    setLoading(true);

    try {
      const Folder_path = `${Year}/${selectedCountry}/${selectedCounty}/${selectedRegion}.csv`;

      const response = await fetch(
        `https://victowolf-bloomwatch.hf.space/read?file_path=${encodeURIComponent(
          Folder_path
        )}`
      );

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.text();
      const CSV_string = data;

      if (!CSV_string || CSV_string.trim() === "") {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2000);
        return;
      }

      const parsedData = Papa.parse(CSV_string, {
        header: true,
        skipEmptyLines: true,
      });

      console.log("Parsed CSV:", parsedData.data);
      setChartData(parsedData.data);
      //-----------------------------------------------
      const historyRes = await fetch(
        `https://victowolf-bloomwatch.hf.space/history?region=${encodeURIComponent(
          selectedRegion
        )}`
      );

      if (!historyRes.ok)
        throw new Error(`History HTTP error: ${historyRes.status}`);

      const history = await historyRes.json();
      const historyJson = await JSON.stringify(history, null, 2);
      console.log("Region History JSON:", historyJson);
      setRegionHistory(historyJson);

      //-------------------------------------------------

      const analysisRes = await fetch(
        "https://victowolf-bloomwatch.hf.space/seasonA",
        {
          method: "POST",
          body: new URLSearchParams({ prompt: historyJson + CSV_string }),
        }
      );

      if (!analysisRes.ok)
        throw new Error(`Analysis HTTP error: ${analysisRes.status}`);

      const analysisJson = await analysisRes.json();
      console.log("Season Analysis JSON:", analysisJson);
      setSeasonAnalysis(analysisJson);

      //---------------------------------------------------------
      try {
        const historicalRes = await fetch(
          "https://victowolf-bloomwatch.hf.space/historicalA",
          {
            method: "POST",
            body: new URLSearchParams({ prompt: historyJson + CSV_string }),
          }
        );

        if (!historicalRes.ok)
          throw new Error(`Historical HTTP error: ${historicalRes.status}`);

        const historicalJson = await historicalRes.json();
        console.log("Historical Analysis JSON:", historicalJson);
        setHistoricalData(historicalJson);
      } catch (err) {
        console.error("Historical fetch error:", err);
      }
      //----------------------------------------------------------
      try {
        const estimationRes = await fetch(
          "https://victowolf-bloomwatch.hf.space/estimation",
          {
            method: "POST",
            body: new URLSearchParams({ prompt: selectedRegion + CSV_string }),
          }
        );

        if (!estimationRes.ok)
          throw new Error(`Estimation HTTP error: ${estimationRes.status}`);

        const estimationJson = await estimationRes.json();
        console.log("Estimation JSON:", estimationJson);
        setGrowthData(estimationJson);
      } catch (err) {
        console.error("Estimation fetch error:", err);
      }
      //-----------------------------------------------------------------
      try {
        const nutrientRes = await fetch(
          "https://victowolf-bloomwatch.hf.space/nutrientA",
          {
            method: "POST",
            body: new URLSearchParams({
              prompt: JSON.stringify({
                location: selectedRegion,
                year: Year,
              }),
            }),
          }
        );

        if (!nutrientRes.ok)
          throw new Error(`Nutrient HTTP error: ${nutrientRes.status}`);

        const nutrientJson = await nutrientRes.json();
        console.log("Nutrient Analysis JSON:", nutrientJson);
        setNutrientData(nutrientJson);
      } catch (err) {
        console.error("Nutrient fetch error:", err);
      }
      //-----------------------------------------------------------------
      try {
        const ecologicalRes = await fetch(
          "https://victowolf-bloomwatch.hf.space/ecologicalA",
          {
            method: "POST",
            body: new URLSearchParams({
              prompt: JSON.stringify({
                region: selectedRegion,
                year: Year,
                History: historyJson,
                csv_data: CSV_string,
                Season_Analysis: seasonAnalysis,
                Historical_Analysis: historicalData,
                Year_estimation: growthData,
                Nutrient_Analysis: nutrientData,
              }),
            }),
          }
        );

        if (!ecologicalRes.ok)
          throw new Error(`Ecological HTTP error: ${ecologicalRes.status}`);

        const ecologicalJson = await ecologicalRes.json();
        console.log("Ecological Analysis JSON:", ecologicalJson);
        setEcologicalData(ecologicalJson);
      } catch (err) {
        console.error("Ecological fetch error:", err);
      }

      // You can process CSV_string further here (e.g., display, download, parse)
    } catch (err) {
      console.error(err);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const availableCounties = selectedCountry
    ? counties[selectedCountry] || []
    : [];
  const availableRegions = selectedCounty ? regions[selectedCounty] || [] : [];

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="flex flex-col min-h-screen bg-background py-6 relative">
        <div className="flex w-full gap-6 px-0">
          {/* LEFT COLUMN */}
          <div className="flex flex-col w-7/12 gap-6">
            {/* Row 1: Country, County, Region */}
            <div className="flex flex-row gap-6">
              <select
                id="country"
                value={selectedCountry}
                onChange={(e) => onCountryChange(e.target.value)}
                className="w-1/3 rounded border border-border bg-card/50 backdrop-blur-sm p-4 text-lg font-mono"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <select
                id="county"
                value={selectedCounty}
                onChange={(e) => onCountyChange(e.target.value)}
                disabled={!selectedCountry}
                className="w-1/3 rounded border border-border bg-card/50 backdrop-blur-sm p-4 text-lg font-mono disabled:opacity-50"
              >
                <option value="">Select County</option>
                {availableCounties.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>

              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                disabled={!selectedCounty}
                className="w-1/3 rounded border border-border bg-card/50 backdrop-blur-sm p-4 text-lg font-mono disabled:opacity-50"
              >
                <option value="">Select Region</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-row gap-6">
              <input
                id="Year"
                type="text"
                placeholder="Enter Year"
                value={Year}
                onChange={(e) => setYear(e.target.value)}
                className="w-1/3 rounded border border-border bg-card/50 backdrop-blur-sm p-4 text-lg font-mono"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={isFetchDisabled || loading} // disable also when loading
                className={`border-border/50 text-xl py-[29px] px-[50px] ${
                  isFetchDisabled || loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-destructive hover:text-destructive-foreground"
                }`}
                onClick={handle_fetch}
              >
                {loading ? "Loading..." : "Fetch"}
              </Button>
              {/* Alert */}
              {showAlert && (
                <div className="absolute inset-0 flex items-start justify-center z-50 pointer-events-none">
                  <div className="mt-8 bg-black bg-opacity-80 text-xl text-white p-4 rounded-md shadow-lg">
                    No data available OR check your internet connection
                  </div>
                </div>
              )}
            </div>
          </div>

          <h3 className="mb-4 text-lg font-bold text-muted-foreground py-12 text-center font-mono">
            OR
          </h3>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col w-5/12 gap-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter coordinates"
                value=""
                readOnly
                className="w-full rounded border border-border bg-card/50 backdrop-blur-sm p-4 text-lg font-mono cursor-not-allowed"
              />
              <span className="absolute left-1/2 -translate-x-1/2 -top-6 rounded bg-black text-white text-xl px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Coming soon
              </span>
            </div>

            <div className="relative group">
              <input
                type="text"
                placeholder="Enter radius"
                value=""
                readOnly
                className="w-full rounded border border-border bg-card/50 backdrop-blur-sm p-4 text-lg font-mono cursor-not-allowed"
              />
              <span className="absolute left-1/2 -translate-x-1/2 -top-6 rounded bg-black text-white text-xl px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Coming soon
              </span>
            </div>
          </div>
        </div>

        {/* Graph containers and additional containers below with headers inside */}
        <div className="flex flex-col gap-8 w-full max-w-6xl mt-8">
          {/* Row 1: Graphs */}
          <div className="flex flex-row gap-8 w-[1370px]">
            {/* Graph 1 */}
            <div
              className="flex flex-col w-1/2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <h3 className="mb-4 text-lg font-bold text-muted-foreground text-center font-mono">
                Vegitation Graph
              </h3>
              <div
                className="flex-grow bg-white rounded shadow flex items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <BloomChart
                  data={chartData}
                  paramKeys={PARAM_KEYS}
                  eventTags={EVENT_TAGS}
                  colors={COLORS}
                />
              </div>
            </div>
            {/* Graph 2 */}
            <div
              className="flex flex-col w-1/2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <div
                className="flex-grow bg-white rounded shadow flex items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <p className="text-muted-foreground font-mono">Graph 2 Area</p>
              </div>
            </div>
          </div>
          {/* Row 2: Additional containers */}
          <div className="flex flex-row gap-8 w-[1370px]">
            {/* Analysis */}
            <div
              className="flex flex-col w-1/2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <h3 className="mb-4 text-lg font-bold text-muted-foreground text-center font-mono">
                Season Analysis
              </h3>
              <div
                className="flex-grow bg-white rounded shadow p-4 overflow-y-auto"
                style={{ minHeight: "300px" }}
              >
                <SeasonA seasonAnalysis={seasonAnalysis} />
              </div>
            </div>
            {/* Historical Analysis */}
            <div
              className="flex flex-col w-1/2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <h3 className="mb-4 text-lg font-bold text-muted-foreground text-center font-mono">
                Historical Analysis
              </h3>
              <div
                className="flex-grow bg-white rounded shadow p-4 overflow-y-auto"
                style={{ minHeight: "300px" }}
              >
                <HistoricalA historyData={historicalData} />
              </div>
            </div>
          </div>
          {/* Row 3 */}
          <div className="flex flex-row gap-8 w-[1370px]">
            {/*  Season estimation */}
            <div
              className="flex flex-col w-1/2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <h3 className="mb-4 text-lg font-bold text-muted-foreground text-center font-mono">
                Season estimation
              </h3>
              <div
                className="flex-grow bg-white rounded shadow p-4 overflow-y-auto"
                style={{ minHeight: "300px" }}
              >
                <Estimation growthData={growthData} />
              </div>
            </div>
            {/*  Nutrient cycle Analysis */}
            <div
              className="flex flex-col w-1/2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <h3 className="mb-4 text-lg font-bold text-muted-foreground text-center font-mono">
                Nutrient cycle Analysis
              </h3>
              <div
                className="flex-grow bg-white rounded shadow p-4 overflow-y-auto"
                style={{ minHeight: "300px" }}
              >
                <NutrientA nutrientData={nutrientData} />
              </div>
            </div>
          </div>
          {/* Row 4 */}
          <div className="flex flex-row gap-8 w-[1370px]">
            {/*  Ecological Analysis */}
            <div
              className="flex flex-col w-[1500px] bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <h3 className="mb-4 text-lg font-bold text-muted-foreground text-center font-mono">
                Ecological Analysis
              </h3>
              <div
                className="flex-grow bg-white rounded shadow flex items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <EcologicalA ecologicalData={ecologicalData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating buttons */}
      <div className="fixed bottom-8 right-8 flex gap-4 z-50">
        <button
          aria-label="Chatbot"
          className="bg-nasa-blue hover:bg-nasa-blue/80 text-white rounded-full w-36 h-14 shadow-lg flex items-center justify-center text-lg font-bold cursor-pointer"
        >
          Chatbot
        </button>
        <button
          aria-label="Download"
          className="bg-operational-green hover:bg-operational-green/80 text-white rounded-full w-36 h-14 shadow-lg flex items-center justify-center text-lg font-bold cursor-pointer"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default Regionspecific;
