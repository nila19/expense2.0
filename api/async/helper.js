// Used to watch amount of Promises executing in a single moment of time
let counter = 0;
let interval;

// Overall amount of operations
const numberOfOperations = 10;
let completedOperations = 0;

// Arguments per operation
const listOfArguments = [];
// Delays per operation to fake async request
const listOfDelays = [];

// Fill delays in order to use the same array between all invocations
// Single delay is a value in milliseconds from 1000 to 10000
for (let i = 0; i < numberOfOperations; i++) {
  listOfArguments.push(i);
  listOfDelays.push(Math.ceil(Math.random() * 9) * 1000);
}

// Fake async: resolve an array through arbitrary delay
// Increase a counter in order to watch amount of Promises executed
const asyncOperation = index => {
  counter++;
  return new Promise(resolve =>
    setTimeout(() => {
      const msg = "Operation performed:" + index + ", delay: " + listOfDelays[index];
      console.log(msg);
      counter--;
      completedOperations++;
      resolve(index);
    }, listOfDelays[index])
  );
};

// Helper function to see the amount of running Promises each second
const watchCounter = () => {
  console.log("Promises running in the beginning:", counter);

  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(() => {
    console.log("Promises running:", counter);
    if (numberOfOperations == completedOperations) {
      clearInterval(interval);
    }
  }, 1000);
};

async function take0() {
  // Harvesting
  const results = [];
  for (const argument of listOfArguments) {
    const index = await asyncOperation(argument);
    results.push(index);
  }
  return results;
}

async function take1() {
  const results = listOfArguments.map(async e => await asyncOperation(e));
  return results;
}

async function take2() {
  // creating the promise will start executing the promise immediately.
  const promises = listOfArguments.map(e => asyncOperation(e));
  const results = promises.map(async e => await e);
  return results;
}

watchCounter();
// take0();
take1();
// take2();
