import type { Process } from "@shared/schema";

interface ProcessResult {
  process: Process;
  startTime: number;
  endTime: number;
  waitingTime: number;
  turnaroundTime: number;
}

export function fcfs(processes: Process[]): ProcessResult[] {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const results: ProcessResult[] = [];
  let currentTime = 0;

  sorted.forEach(process => {
    currentTime = Math.max(currentTime, process.arrivalTime);
    const startTime = currentTime;
    const endTime = startTime + process.burstTime;
    const waitingTime = startTime - process.arrivalTime;
    const turnaroundTime = endTime - process.arrivalTime;

    results.push({
      process,
      startTime,
      endTime,
      waitingTime,
      turnaroundTime
    });

    currentTime = endTime;
  });

  return results;
}

export function roundRobin(processes: Process[], quantum: number): ProcessResult[] {
  const results: ProcessResult[] = [];
  const queue = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  let currentTime = 0;
  const remainingTime = new Map(queue.map(p => [p.id, p.burstTime]));

  while (queue.length > 0) {
    const process = queue.shift()!;
    const remaining = remainingTime.get(process.id)!;
    
    if (remaining > 0) {
      const executeTime = Math.min(quantum, remaining);
      const startTime = currentTime;
      const endTime = startTime + executeTime;
      
      results.push({
        process,
        startTime,
        endTime,
        waitingTime: startTime - process.arrivalTime,
        turnaroundTime: endTime - process.arrivalTime
      });

      remainingTime.set(process.id, remaining - executeTime);
      currentTime = endTime;

      if (remaining - executeTime > 0) {
        queue.push(process);
      }
    }
  }

  return results;
}

export function priority(processes: Process[]): ProcessResult[] {
  const sorted = [...processes].sort((a, b) => 
    a.priority === b.priority ? a.arrivalTime - b.arrivalTime : a.priority - b.priority
  );
  return fcfs(sorted);
}

export function sjf(processes: Process[]): ProcessResult[] {
  const results: ProcessResult[] = [];
  let currentTime = 0;
  let remaining = [...processes];

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime);
    
    if (available.length === 0) {
      currentTime = Math.min(...remaining.map(p => p.arrivalTime));
      continue;
    }

    const next = available.reduce((min, p) => 
      p.burstTime < min.burstTime ? p : min
    );

    const startTime = currentTime;
    const endTime = startTime + next.burstTime;
    
    results.push({
      process: next,
      startTime,
      endTime,
      waitingTime: startTime - next.arrivalTime,
      turnaroundTime: endTime - next.arrivalTime
    });

    currentTime = endTime;
    remaining = remaining.filter(p => p.id !== next.id);
  }

  return results;
}

export function srtf(processes: Process[]): ProcessResult[] {
  const results: ProcessResult[] = [];
  let currentTime = 0;
  const remainingTime = new Map(processes.map(p => [p.id, p.burstTime]));
  let remaining = [...processes];

  while (remaining.length > 0) {
    const available = remaining.filter(p => p.arrivalTime <= currentTime);
    
    if (available.length === 0) {
      currentTime = Math.min(...remaining.map(p => p.arrivalTime));
      continue;
    }

    const next = available.reduce((min, p) => 
      remainingTime.get(p.id)! < remainingTime.get(min.id)! ? p : min
    );

    const startTime = currentTime;
    const executeTime = 1; // Execute for 1 time unit
    const endTime = startTime + executeTime;
    
    results.push({
      process: next,
      startTime,
      endTime,
      waitingTime: startTime - next.arrivalTime,
      turnaroundTime: endTime - next.arrivalTime
    });

    const remaining_time = remainingTime.get(next.id)! - executeTime;
    remainingTime.set(next.id, remaining_time);
    
    if (remaining_time === 0) {
      remaining = remaining.filter(p => p.id !== next.id);
    }

    currentTime = endTime;
  }

  return results;
}
