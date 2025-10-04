import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState("login");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validation - in real app would authenticate
    if (mode === "login" && email && password) {
      navigate("/dashboard");
    } else if (mode === "signup" && email && password && confirmPassword && fullName) {
      if (password === confirmPassword) {
        navigate("/dashboard");
      }
    }
  };

  const handleGuestLogin = () => {
    navigate("/dashboard");
  };

  return (
    <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-border/50">
      <CardHeader className="space-y-4">
        <ToggleGroup type="single" value={mode} onValueChange={(value) => value && setMode(value)} className="grid w-full grid-cols-2">
          <ToggleGroupItem value="login" aria-label="Login" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Login
          </ToggleGroupItem>
          <ToggleGroupItem value="signup" aria-label="Sign up" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            Sign Up
          </ToggleGroupItem>
        </ToggleGroup>
        <CardTitle className="text-2xl font-bold text-center glow-blue">
          {mode === "login" ? "Mission Control Access" : "Join Mission Control"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          {mode === "login" 
            ? "Enter your credentials to access BloomWatch systems"
            : "Create an account to access BloomWatch systems"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-input/50 border-border/50 focus:border-nasa-blue focus:ring-nasa-blue/20"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="astronaut@nasa.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-input/50 border-border/50 focus:border-nasa-blue focus:ring-nasa-blue/20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input/50 border-border/50 focus:border-nasa-blue focus:ring-nasa-blue/20"
              required
            />
          </div>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-input/50 border-border/50 focus:border-nasa-blue focus:ring-nasa-blue/20"
                required
              />
            </div>
          )}
          <Button type="submit" variant="space" size="lg" className="w-full">
            {mode === "login" ? "INITIATE LOGIN SEQUENCE" : "CREATE ACCOUNT"}
          </Button>
          <Button 
            type="button" 
            onClick={handleGuestLogin}
            variant="outline" 
            size="lg" 
            className="w-full border-border/50 hover:bg-card/50"
          >
            GUEST LOGIN
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;