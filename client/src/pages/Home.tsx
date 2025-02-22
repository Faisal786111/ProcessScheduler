import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Cpu, ArrowRight } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-4">
          <Cpu className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          CPU Scheduling Visualizer
        </h1>
        <p className="text-xl text-muted-foreground">
          Interactive visualization tool for common CPU scheduling algorithms
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2">
              <li>• First Come First Serve (FCFS)</li>
              <li>• Round Robin (RR)</li>
              <li>• Priority Scheduling</li>
              <li>• Shortest Job First (SJF)</li>
              <li>• Shortest Remaining Time First (SRTF)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Try It Out</h2>
            <p className="mb-4">
              Experiment with different scheduling algorithms and see how they affect process execution.
            </p>
            <Button 
              onClick={() => setLocation("/scheduler")}
              className="w-full"
            >
              Go to Scheduler
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}