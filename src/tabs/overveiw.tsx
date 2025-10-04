import Navbar from "@/components/Navbar";
import StatusIndicator from "@/components/StatusIndicator";
import earthBg from "@/assets/earth-satellite-bg.jpg";
import logo3 from "@/assets/logo3.webp";

const Overview = () => {
  return (
    <div
      className="min-h-screen relative flex flex-col "
      style={{
        backgroundImage: `url(${earthBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for whole page */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Navbar at full width */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Central card content */}
      <div className="relative z-10 h-[820px] flex justify-center px-4 py-0">
        <div
          className="w-full max-w-6xl overflow-hidden shadow-xl border border-border/50 flex flex-col flex-1"
          style={{
            backgroundImage: `url(${logo3})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Card overlay to keep content readable */}
          <div className="bg-black/60 flex flex-col flex-1">
            {/* Header at the top */}
            <div className="container mx-auto px-6 pt-10 flex items-center justify-between text-white">
              <h1 className="text-3xl md:text-4xl font-bold glow-blue">
                Project Overview
              </h1>
              <StatusIndicator status="operational" />
            </div>

            {/* Paragraph fills remaining space */}
            <main className="container mx-auto px-6 py-[150px] text-white flex-1 space-y-6">
              <p className="text-lg leading-relaxed">
                BloomWatch is an advanced Earth observation initiative
                leveraging NASA's MODIS and VIIRS satellite data to monitor and
                predict global vegetation blooming events. By analyzing
                vegetation indices such as NDVI and EVI, BloomWatch provides
                near-real-time insights into plant phenology, offering critical
                information for agriculture, ecology, and climate science. The
                platform delivers dual-tiered access: a user-friendly dashboard
                for farmers, offering localized bloom alerts and actionable
                guidance, and a comprehensive interface for researchers,
                providing detailed vegetation metrics and anomaly detection
                tools.
              </p>
              <p className="text-lg leading-relaxed">
                Beyond its scientific applications, BloomWatch also captures the
                cultural and ecological significance of plant blooming patterns,
                fostering a deeper understanding of Earth's biosphere. This
                project exemplifies the integration of satellite technology with
                practical solutions to address global challenges in food
                security, biodiversity, and environmental monitoring.
              </p>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
