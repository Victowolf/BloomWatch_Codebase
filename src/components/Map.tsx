import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const WorldMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Side panel state
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Upload state
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [bloomType, setBloomType] = useState<string>("");
  const [species, setSpecies] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [bloomStage, setBloomStage] = useState<string>("");

  // Success dialog
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [31.7762, 73.2268],
        zoom: 2,
        minZoom: 2,
        maxZoom: 17,
        scrollWheelZoom: true,
      });

      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      );

      const satelliteLayer = L.layerGroup([
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
          }
        ),
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
          { attribution: "Labels &copy; Esri" }
        ),
      ]);

      satelliteLayer.addTo(mapRef.current);

      const ndviWmsLayer = L.tileLayer.wms(
        "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMSServer",
        {
          layers: "1",
          format: "image/png",
          transparent: true,
          attribution: "NDVI &copy; Esri",
          opacity: 0.6,
        }
      );

      const redIcon = new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      L.control
        .layers(
          { "Street Map": streetLayer, Satellite: satelliteLayer },
          { "NDVI (Vegetation Index)": ndviWmsLayer },
          { position: "topleft", collapsed: false }
        )
        .addTo(mapRef.current);

      mapRef.current.on("click", (e: any) => {
        setIsPanelOpen(true);
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });

        if ((mapRef.current as any)._marker) {
          mapRef.current.removeLayer((mapRef.current as any)._marker);
        }

        const marker = L.marker(e.latlng, { icon: redIcon }).addTo(
          mapRef.current!
        );
        (mapRef.current as any)._marker = marker;
      });
    }
  }, []);

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 3 - images.length);
    setImages([...images, ...newFiles]);
  };

  // Reset form
  const resetForm = () => {
    setImages([]);
    setLocation(null);
    setDate(new Date().toISOString().slice(0, 10));
    setBloomType("");
    setSpecies("");
    setNotes("");
    setBloomStage("");
  };

  // Handle submit
  const handleSubmit = () => {
    if (!location || !date || !bloomType || !species || !bloomStage) return;

    // You can send data to backend here
    console.log({
      location,
      date,
      bloomType,
      species,
      bloomStage,
      notes,
      images,
    });

    setShowSuccess(true);
    resetForm();
    setIsPanelOpen(false);

    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Check if form is valid
  const isFormValid =
    location && date && bloomType && species && bloomStage && images.length > 0;

  return (
    <div className="relative h-[100vh] w-full rounded-lg overflow-hidden border border-gray-300">
      {/* Map */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Expand/Collapse button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute top-4 right-0.5 z-50 bg-black shadow-md rounded-full px-3 py-1 text-sm font-semibold"
      >
        {isPanelOpen ? "← Close" : "→ Open"}
      </button>

      {/* Side Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-80 bg-gray-900 text-white shadow-xl transform transition-transform duration-300 z-40 p-4 overflow-y-auto pointer-events-auto ${
          isPanelOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Contribute Observation</h2>

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center mb-4">
          <p className="mb-2">Upload to validate bloom predictions</p>
          <p className="text-sm text-gray-400">
            Maximum 3 images allowed one time
          </p>
          <input
            type="file"
            accept="image/png, image/jpeg"
            multiple
            className="hidden"
            id="fileUpload"
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          <label
            htmlFor="fileUpload"
            className="mt-3 inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Upload Image
          </label>
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-20 h-20">
                <img
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="object-cover w-full h-full rounded-md border border-gray-700"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <h3 className="font-semibold mb-1">Location</h3>
          {location ? (
            <p className="text-sm">
              📍 Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
            </p>
          ) : (
            <p className="text-sm text-gray-400">Click map to select</p>
          )}
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Date of Observation
          </label>
          <input
            type="date"
            className="w-full border rounded-md p-2 bg-gray-800 text-white border-gray-700"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Bloom Type */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Type of Bloom</label>
          <select
            className="w-full border rounded-md p-2 mb-2 bg-gray-800 text-white border-gray-700"
            value={bloomType}
            onChange={(e) => setBloomType(e.target.value)}
          >
            <option value="">Select</option>
            <option>Flowering</option>
            <option>Leaf-out</option>
            <option>Crop bloom</option>
            <option>Other</option>
          </select>
          <input
            type="text"
            placeholder="Species / Crop name"
            className="w-full border rounded-md p-2 bg-gray-800 text-white border-gray-700"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
          />
        </div>

        {/* Bloom Stage */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Bloom Stage</label>
          <div className="flex gap-2 text-xl">
            {["🌱", "🌸", "🌼", "🍂"].map((stage) => (
              <button
                key={stage}
                onClick={() => setBloomStage(stage)}
                className={`${
                  bloomStage === stage ? "bg-gray-700 rounded-md px-2" : ""
                }`}
              >
                {stage}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Notes (Optional)</label>
          <textarea
            maxLength={200}
            className="w-full border rounded-md p-2 bg-gray-800 text-white border-gray-700"
            placeholder="E.g., Heavy rainfall here this week"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          className={`w-full py-2 rounded-md text-white ${
            isFormValid
              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
              : "bg-gray-600 cursor-not-allowed"
          }`}
          onClick={handleSubmit}
          disabled={!isFormValid}
        >
          Submit Observation
        </button>
      </div>

      {/* Success Dialog */}
      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black bg-opacity-80 text-white p-4 rounded-md shadow-lg">
            Observation submitted successfully!
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldMap;
