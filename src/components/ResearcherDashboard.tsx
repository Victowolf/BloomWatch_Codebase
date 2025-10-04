import { useState } from "react";
import RegionSpecific from "@/components/Regionspecific.tsx"; // Update path as needed

const ResearcherDashboard = () => {
  const TABS = [{ label: "Region specific" }, { label: "Compare regions" }];

  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-background py-16 px-8 flex flex-col items-center">
      {/* Tabs */}
      <div className="grid grid-cols-2 gap-8 max-w-lg w-full mb-10">
        {TABS.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            className={`rounded-md py-4 px-6 font-semibold text-lg backdrop-blur-sm border transition-colors
              ${
                activeTab === idx
                  ? "bg-card/80 ring-2 ring-warning-amber border-warning-amber text-warning-amber"
                  : "bg-card/50 border-border/50 text-muted-foreground hover:text-warning-amber"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Render RegionSpecific component or "Coming soon" */}
      <div className="w-full">
        {activeTab === 0 && <RegionSpecific />}
        {activeTab === 1 && (
          <center>
            <div className="max-w-4xl w-full min-h-[300px] flex flex-col items-center justify-center p-8 mt-8 rounded-lg bg-card/30 backdrop-blur-sm border border-border/30">
              <span className="text-2xl font-bold text-warning-amber text-center">
                Coming soon....
              </span>
            </div>
          </center>
        )}
      </div>
    </div>
  );
};

export default ResearcherDashboard;
