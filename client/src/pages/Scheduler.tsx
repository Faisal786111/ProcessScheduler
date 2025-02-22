import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { motion } from "framer-motion";
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

const processesFormSchema = z.object({
  processes: z.array(processSchema).min(1, "Add at least one process"),
  algorithm: z.enum(["FCFS", "RR", "Priority", "SJF", "SRTF"]),
  quantum: z.number().min(1).optional(),
});

type ProcessesFormValues = z.infer<typeof processesFormSchema>;

export default function Scheduler() {
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [averageStats, setAverageStats] = useState({ 
    avgWaiting: 0, 
    avgTurnaround: 0 
  });

  const form = useForm<ProcessesFormValues>({
    resolver: zodResolver(processesFormSchema),
    defaultValues: {
      processes: [{ name: "P1", arrivalTime: 0, burstTime: 1, priority: 0 }],
      algorithm: "FCFS",
      quantum: 2,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "processes",
  });

  const onSubmit = (data: ProcessesFormValues) => {
    let simulationResults;
    const processes = data.processes.map((p, idx) => ({ ...p, id: idx + 1 }));

    switch (data.algorithm) {
      case "FCFS":
        simulationResults = fcfs(processes);
        break;
      case "RR":
        simulationResults = roundRobin(processes, data.quantum || 2);
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

  // Create Gantt chart data with idle time
  const ganttData = [];
  if (results.length > 0) {
    let currentTime = 0;
    results.forEach((result) => {
      // Add idle time if there's a gap
      if (result.startTime > currentTime) {
        ganttData.push({
          name: "Idle",
          start: currentTime,
          duration: result.startTime - currentTime,
          fill: "#e5e5e5"
        });
      }
      ganttData.push({
        name: result.process.name,
        start: result.startTime,
        duration: result.endTime - result.startTime,
        fill: "#8884d8"
      });
      currentTime = result.endTime;
    });
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Processes</h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: `P${fields.length + 1}`, arrivalTime: 0, burstTime: 1, priority: 0 })}
                  >
                    Add Process
                  </Button>
                </div>

                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Arrival Time</TableHead>
                        <TableHead>Burst Time</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`processes.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`processes.${index}.arrivalTime`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`processes.${index}.burstTime`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`processes.${index}.priority`}
                              render={({ field }) => (
                                <FormItem>
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
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Simulation Settings</h2>

                <FormField
                  control={form.control}
                  name="algorithm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Algorithm</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select algorithm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FCFS">First Come First Serve</SelectItem>
                          <SelectItem value="RR">Round Robin</SelectItem>
                          <SelectItem value="Priority">Priority</SelectItem>
                          <SelectItem value="SJF">Shortest Job First</SelectItem>
                          <SelectItem value="SRTF">Shortest Remaining Time First</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("algorithm") === "RR" && (
                  <FormField
                    control={form.control}
                    name="quantum"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Quantum</FormLabel>
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
                )}

                <Button type="submit" className="w-full">
                  Run Simulation
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Gantt Chart</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={ganttData}
                    layout="horizontal"
                    barSize={50}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 'auto']} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => {
                        const start = props.payload.start;
                        return [`Start: ${start}, Duration: ${value}`];
                      }}
                    />
                    <Bar 
                      dataKey="duration"
                      fill={(entry) => entry.fill}
                      name="Execution Time"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Process Details</h2>
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
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Average Statistics</h2>
                <div className="space-y-2">
                  <p>Average Waiting Time: {averageStats.avgWaiting.toFixed(2)}</p>
                  <p>Average Turnaround Time: {averageStats.avgTurnaround.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}