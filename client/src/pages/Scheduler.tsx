import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { processSchema, type Process, type AlgorithmType } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fcfs, roundRobin, priority, sjf, srtf } from "@/lib/algorithms";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function Scheduler() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("FCFS");
  const [quantum, setQuantum] = useState(2);
  const [results, setResults] = useState<any[]>([]);

  const form = useForm({
    resolver: zodResolver(processSchema),
    defaultValues: {
      name: "",
      arrivalTime: 0,
      burstTime: 1,
      priority: 0,
    },
  });

  const onSubmit = (data: any) => {
    const newProcess: Process = {
      id: processes.length + 1,
      ...data,
    };
    setProcesses([...processes, newProcess]);
    form.reset();
  };

  const runSimulation = () => {
    let simulationResults;
    switch (algorithm) {
      case "FCFS":
        simulationResults = fcfs(processes);
        break;
      case "RR":
        simulationResults = roundRobin(processes, quantum);
        break;
      case "Priority":
        simulationResults = priority(processes);
        break;
      case "SJF":
        simulationResults = sjf(processes);
        break;
      case "SRTF":
        simulationResults = srtf(processes);
        break;
    }

    const chartData = simulationResults.map((result) => ({
      name: result.process.name,
      start: result.startTime,
      end: result.endTime,
      waiting: result.waitingTime,
      turnaround: result.turnaroundTime,
    }));

    setResults(chartData);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add Process</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Process Name</FormLabel>
                      <FormControl>
                        <Input placeholder="P1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="arrivalTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="burstTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Burst Time</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">Add Process</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Simulation Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Algorithm</FormLabel>
                <Select
                  value={algorithm}
                  onValueChange={(value) => setAlgorithm(value as AlgorithmType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FCFS">First Come First Serve</SelectItem>
                    <SelectItem value="RR">Round Robin</SelectItem>
                    <SelectItem value="Priority">Priority</SelectItem>
                    <SelectItem value="SJF">Shortest Job First</SelectItem>
                    <SelectItem value="SRTF">
                      Shortest Remaining Time First
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {algorithm === "RR" && (
                <div className="space-y-2">
                  <FormLabel>Time Quantum</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    value={quantum}
                    onChange={(e) => setQuantum(parseInt(e.target.value))}
                  />
                </div>
              )}

              <Button
                onClick={runSimulation}
                disabled={processes.length === 0}
                className="w-full"
              >
                Run Simulation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {results.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            <div className="overflow-x-auto">
              <LineChart
                width={800}
                height={400}
                data={results}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="turnaround"
                  stroke="#8884d8"
                  name="Turnaround Time"
                />
                <Line
                  type="monotone"
                  dataKey="waiting"
                  stroke="#82ca9d"
                  name="Waiting Time"
                />
              </LineChart>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
