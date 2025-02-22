import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function About() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      <motion.h1 
        {...fadeIn}
        className="text-3xl font-bold mb-8"
      >
        About CPU Scheduling
      </motion.h1>

      <div className="space-y-6">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">What is CPU Scheduling?</h2>
              <p className="text-muted-foreground">
                CPU Scheduling is the process of determining which process in the ready queue will be allocated 
                to the CPU. It is a fundamental operating system concept that aims to maximize CPU utilization 
                and provide fair access to system resources.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Supported Algorithms</h2>

              <div className="space-y-4">
                <motion.div 
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="font-medium">First Come First Serve (FCFS)</h3>
                  <p className="text-sm text-muted-foreground">
                    The simplest scheduling algorithm that executes processes in order of arrival.
                  </p>
                </motion.div>

                <motion.div 
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="font-medium">Round Robin (RR)</h3>
                  <p className="text-sm text-muted-foreground">
                    Each process is assigned a fixed time quantum and executed in a circular queue.
                  </p>
                </motion.div>

                <motion.div 
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="font-medium">Priority Scheduling</h3>
                  <p className="text-sm text-muted-foreground">
                    Processes are executed based on priority values, with higher priority processes executed first.
                  </p>
                </motion.div>

                <motion.div 
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.9 }}
                >
                  <h3 className="font-medium">Shortest Job First (SJF)</h3>
                  <p className="text-sm text-muted-foreground">
                    Selects the process with the smallest burst time to execute next.
                  </p>
                </motion.div>

                <motion.div 
                  variants={fadeIn}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 1.0 }}
                >
                  <h3 className="font-medium">Shortest Remaining Time First (SRTF)</h3>
                  <p className="text-sm text-muted-foreground">
                    Preemptive version of SJF where the process with the shortest remaining time is selected.
                  </p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}