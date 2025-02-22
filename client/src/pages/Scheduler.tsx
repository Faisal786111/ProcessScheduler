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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fcfs, roundRobin, priority, sjf, srtf } from "@/lib/algorithms";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface ProcessResult {
  process: Process;
  startTime: number;
  endTime: number;
  waitingTime: number;
  turnaroundTime: number;
}

export default function Scheduler() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("FCFS");
  const [quantum, setQuantum] = useState(2);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [averageStats, setAverageStats] = useState({ 
    avgWaiting: 0, 
    avgTurnaround: 0 
  });

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

    // Calculate average statistics
    const totalWaiting = simulationResults.reduce((sum, result) => sum + result.waitingTime, 0);
    const totalTurnaround = simulationResults.reduce((sum, result) => sum + result.turnaroundTime, 0);

    setAverageStats({
      avgWaiting: totalWaiting / processes.length,
      avgTurnaround: totalTurnaround / processes.length
    });

    setResults(simulationResults);
  };

  const clearProcesses = () => {
    setProcesses([]);
    setResults([]);
    setAverageStats({ avgWaiting: 0, avgTurnaround: 0 });
  };

  // Create Gantt chart data
  const ganttData = results.map((result) => ({
    name: result.process.name,
    start: result.startTime,
    duration: result.endTime - result.startTime,
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
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

                  {(algorithm === "Priority") && (
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
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Add Process</Button>
                    <Button type="button" variant="outline" onClick={clearProcesses}>Clear All</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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
        </motion.div>
      </div>

      {processes.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Process Table</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Process</TableHead>
                      <TableHead>Arrival Time</TableHead>
                      <TableHead>Burst Time</TableHead>
                      {algorithm === "Priority" && <TableHead>Priority</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {processes.map((process) => (
                        <motion.tr
                          key={process.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TableCell>{process.name}</TableCell>
                          <TableCell>{process.arrivalTime}</TableCell>
                          <TableCell>{process.burstTime}</TableCell>
                          {algorithm === "Priority" && (
                            <TableCell>{process.priority}</TableCell>
                          )}
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {results.length > 0 && (
        <>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ganttData}
                      layout="vertical"
                      barSize={30}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip 
                        formatter={(value: any, name: any) => {
                          if (name === 'duration') return `Duration: ${value}`;
                          return `Start: ${value}`;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="duration" 
                        stackId="a" 
                        fill="#8884d8" 
                        name="Execution Time"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Results</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Process Details</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Process</TableHead>
                          <TableHead>Waiting Time</TableHead>
                          <TableHead>Turnaround Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((result) => (
                          <TableRow key={result.process.id}>
                            <TableCell>{result.process.name}</TableCell>
                            <TableCell>{result.waitingTime}</TableCell>
                            <TableCell>{result.turnaroundTime}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Average Statistics</h3>
                    <div className="space-y-2">
                      <p>Average Waiting Time: {averageStats.avgWaiting.toFixed(2)}</p>
                      <p>Average Turnaround Time: {averageStats.avgTurnaround.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}