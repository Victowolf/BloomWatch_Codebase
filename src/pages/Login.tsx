import Navbar from "@/components/Navbar";
import LoginForm from "@/components/LoginForm";
import StatusIndicator from "@/components/StatusIndicator";
import { FaGoogle } from "react-icons/fa"; // Requires: npm install react-icons

const Login = () => {
  return (
    <div className="min-h-screen bg-space-darker relative overflow-hidden">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-60 z-0"
        style={{
          backgroundImage: `url(https://github.com/Victowolf/Quantum-shorts-assets/blob/main/earth.jpg?raw=true)`,
        }}
      />

      <div className="absolute inset-0 bg-gradient-earth opacity-60" />

      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
            {/* Left side */}
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <h1 className="text-nasa-title glow-blue">BloomWatch</h1>
                <p className="text-nasa-subtitle text-muted-foreground">
                  Vegetation Bloom Monitoring System
                  <br />
                  <span className="text-lg opacity-80">
                    (Powered by MODIS & VIIRS)
                  </span>
                </p>
              </div>
              <div className="space-y-3">
                <div className="inline-block bg-card/20 backdrop-blur-sm border-2 border-white rounded-lg px-4 py-2">
                  <span className="text-sm font-mono tracking-widest text-white">
                    Near Real-Time Monitoring Available
                  </span>
                </div>
                <StatusIndicator status="operational" />
              </div>
              <div className="space-y-2 text-sm text-muted-foreground max-w-md">
                <p>
                  Monitoring global vegetation patterns using advanced satellite
                  imagery from NASA's MODIS and VIIRS instruments.
                </p>
                <p className="text-xs opacity-75">
                  Real-time analysis • Global coverage • 16 Days Frequency
                </p>
              </div>
            </div>

            {/* Right side - login form and social logins */}
            <div className="flex flex-col items-center justify-center w-full">
              <div className="w-full max-w-md bg-space-darkest/90 border border-white/20 rounded-lg p-6">
                <LoginForm />

                {/* OR separator */}
                <div className="flex items-center my-6">
                  <div className="flex-grow h-px bg-white/20" />
                  <span className="mx-4 text-md font-mono text-white/80 tracking-wider">
                    OR
                  </span>
                  <div className="flex-grow h-px bg-white/20" />
                </div>

                {/* Dark themed Google login button */}
                <div className="relative group w-full">
                  <button
                    className="w-full flex items-center justify-center gap-3 px-6 py-3
                      rounded-lg bg-space-darker border border-white/30 hover:bg-white/10 transition
                      focus:outline-none cursor-not-allowed"
                    disabled
                  >
                    <FaGoogle className="h-5 w-5 text-white" />
                    <span className="text-white font-semibold">
                      Login with Google
                    </span>
                  </button>

                  {/* Tooltip */}
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -top-6 rounded bg-black 
                    text-white text-xl px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Login;
