import { ganttChartInfoType } from '.';

export const npp = (
  arrivalTime: number[],
  burstTime: number[],
  priorities: number[],
  higherNumberHigherPriority: boolean,
) => {
  const comparePriority = (a: number, b: number) => {
    return higherNumberHigherPriority ? b - a : a - b;
  };

  const processesInfo = arrivalTime
    .map((item, index) => {
      const job =
        arrivalTime.length > 26
          ? `P${index + 1}`
          : (index + 10).toString(36).toUpperCase();

      return {
        job,
        at: item,
        bt: burstTime[index],
        priority: priorities[index],
      };
    })
    .sort((p1, p2) => {
      if (p1.at !== p2.at) return p1.at - p2.at;
      return comparePriority(p1.priority, p2.priority);
    });

  let finishTime: number[] = [];
  let ganttChartInfo: ganttChartInfoType = [];

  const solvedProcessesInfo = [];
  const readyQueue = [];
  const finishedJobs = [];

  for (let i = 0; i < processesInfo.length; i++) {
    if (i === 0) {
      readyQueue.push(processesInfo[0]);
      finishTime.push(processesInfo[0].at + processesInfo[0].bt);
      solvedProcessesInfo.push({
        ...processesInfo[0],
        ft: finishTime[0],
        tat: finishTime[0] - processesInfo[0].at,
        wat: finishTime[0] - processesInfo[0].at - processesInfo[0].bt,
      });

      processesInfo.forEach((p) => {
        if (p.at <= finishTime[0] && !readyQueue.includes(p)) {
          readyQueue.push(p);
        }
      });

      readyQueue.shift();
      finishedJobs.push(processesInfo[0]);

      ganttChartInfo.push({
        job: processesInfo[0].job,
        start: processesInfo[0].at,
        stop: finishTime[0],
      });
    } else {
      if (
        readyQueue.length === 0 &&
        finishedJobs.length !== processesInfo.length
      ) {
        const unfinishedJobs = processesInfo
          .filter((p) => !finishedJobs.includes(p))
          .sort((a, b) => {
            if (a.at !== b.at) return a.at - b.at;
            return comparePriority(a.priority, b.priority);
          });
        readyQueue.push(unfinishedJobs[0]);
      }

      // Equal-priority processes are scheduled in FCFS order.
      const rqSortedByPriority = [...readyQueue].sort((a, b) => {
        const priorityCompare = comparePriority(a.priority, b.priority);
        if (priorityCompare !== 0) return priorityCompare;
        return a.at - b.at;
      });

      const processToExecute = rqSortedByPriority[0];

      const previousFinishTime = finishTime[finishTime.length - 1];

      if (processToExecute.at > previousFinishTime) {
        finishTime.push(processToExecute.at + processToExecute.bt);
        const newestFinishTime = finishTime[finishTime.length - 1];
        ganttChartInfo.push({
          job: processToExecute.job,
          start: processToExecute.at,
          stop: newestFinishTime,
        });
      } else {
        finishTime.push(previousFinishTime + processToExecute.bt);
        const newestFinishTime = finishTime[finishTime.length - 1];
        ganttChartInfo.push({
          job: processToExecute.job,
          start: previousFinishTime,
          stop: newestFinishTime,
        });
      }

      const newestFinishTime = finishTime[finishTime.length - 1];

      solvedProcessesInfo.push({
        ...processToExecute,
        ft: newestFinishTime,
        tat: newestFinishTime - processToExecute.at,
        wat: newestFinishTime - processToExecute.at - processToExecute.bt,
      });

      processesInfo.forEach((p) => {
        if (
          p.at <= newestFinishTime &&
          !readyQueue.includes(p) &&
          !finishedJobs.includes(p)
        ) {
          readyQueue.push(p);
        }
      });

      const indexToRemove = readyQueue.indexOf(processToExecute);
      if (indexToRemove > -1) {
        readyQueue.splice(indexToRemove, 1);
      }

      finishedJobs.push(processToExecute);
    }
  }

  // Sort the processes by job name within arrival time
  solvedProcessesInfo.sort((obj1, obj2) => {
    if (obj1.at > obj2.at) return 1;
    if (obj1.at < obj2.at) return -1;
    if (obj1.job > obj2.job) return 1;
    if (obj1.job < obj2.job) return -1;
    return 0;
  });

  return { solvedProcessesInfo, ganttChartInfo };
};
