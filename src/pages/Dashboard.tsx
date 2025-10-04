import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import WorldMap from "@/components/Map";
import worldMapImage from "@/assets/world-map.jpg";
import StatusIndicator from "@/components/StatusIndicator";
import FarmerDashboard from "@/components/Farmerdashboard.tsx"; // Import FarmerDashboard component
import ResearcherDashboard from "@/components/ResearcherDashboard.tsx"; // Import ResearcherDashboard component

const TABS = [{ label: "Map" }, { label: "Farmer" }, { label: "Researcher" }];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold glow-blue mb-2">
                BloomWatch World Dashboard
              </h1>
              <p className="text-lg text-muted-foreground">
                Select regions to view vegetation bloom insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <StatusIndicator status="operational" />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-border/50 hover:bg-destructive hover:text-destructive-foreground"
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs only*/}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            {TABS.map((tab, idx) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                className={`rounded-lg py-2 px-1 text-center font-semibold text-lg backdrop-blur-sm border transition-colors ${
                  activeTab === idx
                    ? "border-nasa-blue bg-card/80 ring-2 ring-nasa-blue text-nasa-blue"
                    : "border-border/50 bg-card/50 text-muted-foreground hover:text-nasa-blue"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Panel for active tab */}
          <div className="pt-4 pb-8 text-center min-h-[80px]">
            {activeTab === 0}
            {activeTab === 1 && <FarmerDashboard />}
            {activeTab === 2 && <ResearcherDashboard />}
          </div>
        </div>

        {/* Conditional rendering of Map section */}
        {activeTab === 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Global Vegetation Monitor
              </h2>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>🛰️ MODIS Terra/Aqua</span>
                <span>🌍 VIIRS NPP/NOAA</span>
              </div>
            </div>

            <div className="h-[100vh] rounded-lg overflow-hidden border border-border relative">
              <WorldMap />

              <div className="absolute inset-0 bg-gradient-to-t from-space-darker/20 to-transparent pointer-events-none" />
            </div>

            {/* Map legend */}
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">
                Data Sources & Legend
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p>
                    <strong>MODIS:</strong> Moderate Resolution Imaging
                    Spectroradiometer
                  </p>
                  <p>
                    <strong>VIIRS:</strong> Visible Infrared Imaging Radiometer
                    Suite
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Update Frequency:</strong> 16 day (Terra overpasses)
                  </p>
                  <p>
                    <strong>Spatial Resolution:</strong> 250m - 1km
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
