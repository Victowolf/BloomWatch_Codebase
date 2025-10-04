interface StatusIndicatorProps {
  status: "operational" | "warning" | "offline";
  label?: string;
}

const StatusIndicator = ({ status, label = "STATE: OPERATIONAL" }: StatusIndicatorProps) => {
  const getStatusColor = () => {
    switch (status) {
      case "operational":
        return "bg-operational-green";
      case "warning":
        return "bg-warning-amber";
      case "offline":
        return "bg-destructive";
      default:
        return "bg-operational-green";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} shadow-operational animate-pulse`} />
      <span className="text-operational glow-green">{label}</span>
    </div>
  );
};

export default StatusIndicator;