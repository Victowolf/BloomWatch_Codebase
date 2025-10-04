import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Weather from "./Weather";

type Counties = Record<string, string[]>;
type Regions = Record<string, string[]>;

const FarmerDashboard = () => {
  const [countries, setCountries] = useState<string[]>([]);
  const [counties, setCounties] = useState<Counties>({});
  const [regions, setRegions] = useState<Regions>({});
  const [cropNames, setCropNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setCropNames(data.cropNames || []);
        setError(null);
      } catch (err: any) {
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
  const [selectedCropName, setSelectedCropName] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [radius, setRadius] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const isFetchDisabled =
    !selectedCountry ||
    !selectedCounty ||
    !selectedRegion ||
    !selectedCropName ||
    !farmSize;

  // Event handlers
  const onCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCounty("");
    setSelectedRegion("");
  };

  const onCountyChange = (value: string) => {
    setSelectedCounty(value);
    setSelectedRegion("");
  };

  // Computed values
  const availableCounties = selectedCountry
    ? counties[selectedCountry] || []
    : [];
  const availableRegions = selectedCounty ? regions[selectedCounty] || [] : [];

  const handle_fetch = async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split("T")[0];
      const prompt = JSON.stringify({
        region: selectedRegion,
        current_date: today,
      });

      const response = await fetch(
        "https://victowolf-bloomwatch.hf.space/weather",
        {
          method: "POST",
          body: new URLSearchParams({
            prompt,
          }),
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const weatherJson = await response.json();
      console.log("Weather JSON:", weatherJson);

      setWeatherData(weatherJson); // store for rendering
    } catch (err: any) {
      console.error("Failed to fetch weather:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

            {/* Row 2: Crop Name, Farm Size */}
            <div className="flex flex-row gap-6">
              <select
                id="cropName"
                value={selectedCropName}
                onChange={(e) => setSelectedCropName(e.target.value)}
                className="w-1/3 rounded border border-border bg-card/50 backdrop-blur-sm p-4 text-lg font-mono"
              >
                <option value="">Select Crop Name</option>
                {cropNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <input
                id="farmSize"
                type="text"
                placeholder="Enter farm size in ha"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
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
                Weather forcast
              </h3>
              {weatherData ? (
                <Weather weatherData={weatherData} />
              ) : (
                <p className="text-muted-foreground text-center mt-4">
                  {loading ? "Loading..." : "Select region and click Fetch"}
                </p>
              )}
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
                Analysis
              </h3>
              <div
                className="flex-grow bg-white rounded shadow flex items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <p className="text-muted-foreground font-mono">Graph 1 Area</p>
              </div>
            </div>
            {/* Actionables */}
            <div
              className="flex flex-col w-1/2 bg-card/30 backdrop-blur-sm rounded-lg border border-border/30 p-6"
              style={{ minHeight: "500px" }}
            >
              <h3 className="mb-4 text-lg font-bold text-muted-foreground text-center font-mono">
                Actionables
              </h3>
              <div
                className="flex-grow bg-white rounded shadow flex items-center justify-center"
                style={{ minHeight: "300px" }}
              >
                <p className="text-muted-foreground font-mono">Graph 2 Area</p>
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

export default FarmerDashboard;
