import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { fcfs, roundRobin, priority, sjf, srtf } from "@/lib/algorithms";
import { motion } from "framer-motion";
import { Cpu, Settings2, Send, ArrowUp } from 'lucide-react';
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

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
  const [feedback, setFeedback] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [averageStats, setAverageStats] = useState({ 
    avgWaiting: 0, 
    avgTurnaround: 0 
  });
  const { toast } = useToast();
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const currentAlgorithm = form.watch("algorithm");

  useKeyboardShortcut('p', true, () => {
    append({ name: `P${fields.length + 1}`, arrivalTime: 0, burstTime: 1, priority: 0 });
    toast({
      title: "Process Added",
      description: "Use Ctrl+P to quickly add more processes",
    });
  });

  useKeyboardShortcut('r', true, () => {
    if (fields.length > 1) {
      remove(fields.length - 1);
      toast({
        title: "Process Removed",
        description: "Use Ctrl+R to quickly remove processes",
      });
    }
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
    const lastEndTime = Math.max(...simulationResults.map(r => r.endTime));

    setCurrentTime(lastEndTime);
    setAverageStats({
      avgWaiting: totalWaiting / processes.length,
      avgTurnaround: totalTurnaround / processes.length
    });

    setResults(simulationResults);
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      // Store feedback in local storage
      const storedFeedback = JSON.parse(localStorage.getItem('scheduler_feedback') || '[]');
      storedFeedback.push({
        feedback,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('scheduler_feedback', JSON.stringify(storedFeedback));

      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve the simulator.",
      });
      setFeedback("");
    }
  };

  // Create Gantt chart data with idle time
  const ganttData = [];
  if (results.length > 0) {
    let time = 0;
    results.forEach((result) => {
      // Add idle time if there's a gap
      if (result.startTime > time) {
        ganttData.push({
          name: "Idle",
          start: time,
          duration: result.startTime - time,
          isIdle: true
        });
      }
      ganttData.push({
        name: result.process.name,
        start: result.startTime,
        duration: result.endTime - result.startTime,
        isIdle: false
      });
      time = result.endTime;
    });
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pt-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex justify-center items-center gap-3 mb-4"
        >
          <Cpu className="h-12 w-12 text-primary" />
          <Settings2 className="h-8 w-8 text-purple-500 animate-spin-slow" />
        </motion.div>
        <h1 className="text-3xl font-bold">Process Scheduler</h1>
        <p className="text-muted-foreground mt-2">Configure and visualize CPU scheduling algorithms</p>
      </div>

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
                    Add Process (Ctrl+P)
                  </Button>
                </div>

                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Arrival Time</TableHead>
                        <TableHead>Burst Time</TableHead>
                        {currentAlgorithm === "Priority" && <TableHead>Priority</TableHead>}
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
                          {currentAlgorithm === "Priority" && (
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
                          )}
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

                <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
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
              <div className="relative">
                <div className="flex">
                  {ganttData.map((block, index) => (
                    <div
                      key={index}
                      className={`flex-grow text-center p-4 border ${
                        block.isIdle 
                          ? 'bg-gray-100 text-gray-500 border-gray-200' 
                          : 'bg-primary/10 border-primary/20'
                      }`}
                      style={{ width: `${(block.duration / currentTime) * 100}%` }}
                    >
                      <div className="font-medium">{block.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {block.duration} units
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex mt-2">
                  {ganttData.map((block, index) => (
                    <div
                      key={index}
                      className="flex-grow text-center text-sm text-muted-foreground"
                      style={{ width: `${(block.duration / currentTime) * 100}%` }}
                    >
                      {block.start}
                    </div>
                  ))}
                  <div className="text-sm text-muted-foreground">
                    {currentTime}
                  </div>
                </div>
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
                      <TableHead>Arrival Time</TableHead>
                      <TableHead>Completion Time</TableHead>
                      <TableHead>Waiting Time</TableHead>
                      <TableHead>Turnaround Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.process.id}>
                        <TableCell>{result.process.name}</TableCell>
                        <TableCell>{result.process.arrivalTime}</TableCell>
                        <TableCell>{result.endTime}</TableCell>
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
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5">
                    <p className="text-sm text-muted-foreground mb-1">Average Waiting Time</p>
                    <p className="text-2xl font-semibold">{averageStats.avgWaiting.toFixed(2)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/5">
                    <p className="text-sm text-muted-foreground mb-1">Average Turnaround Time</p>
                    <p className="text-2xl font-semibold">{averageStats.avgTurnaround.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Share Your Feedback</h2>
              <div className="space-y-4">
                <Textarea 
                  placeholder="How was your experience with the scheduler? Any suggestions for improvement?"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleFeedbackSubmit}
                  className="w-full"
                  variant="outline"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      {showScrollTop && (
        <Button
          className="fixed bottom-8 right-8 rounded-full p-3"
          onClick={scrollToTop}
          size="icon"
        >
          <ArrowUp className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}