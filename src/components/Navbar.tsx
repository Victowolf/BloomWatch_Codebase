import { Link } from "react-router-dom";

const Navbar = () => {
  const navItems = [
    { label: "|  Home", path: "/" },
    { label: "|  Overview", path: "/overview" },
    { label: "|  Data and Tools", path: "/data-tools" },
    { label: "|  Resources", path: "/resources" },
    { label: "|  Raw Data", path: "/raw-data" },
    { label: "|  API", path: "/api" },
  ];

  return (
    <nav className="bg-space-darker border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-left justify-between h-16">
          {/* NASA-style branding */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <img
                src="https://github.com/Victowolf/Quantum-shorts-assets/blob/main/BloomWatch.png?raw=true"
                alt="Logo"
                className="w-11 h-11 rounded-full object-cover"
              />
              <span className="text-xl font-bold tracking-wider">
                BLOOMWATCH
              </span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="hidden lg:flex items-center space-x-20">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:glow-blue"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button className="text-foreground hover:text-primary">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
