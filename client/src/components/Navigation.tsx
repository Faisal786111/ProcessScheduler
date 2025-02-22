import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Cpu } from "lucide-react";

export default function Navigation() {
  const [location] = useLocation();

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href}>
      <span className={cn(
        "px-4 py-2 text-sm font-medium transition-colors cursor-pointer",
        location === href 
          ? "text-primary bg-accent" 
          : "text-muted-foreground hover:text-primary"
      )}>
        {children}
      </span>
    </Link>
  );

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CPU Scheduler</span>
          </div>

          <div className="flex items-center space-x-4">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/scheduler">Scheduler</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}