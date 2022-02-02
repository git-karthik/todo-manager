const { OPERATION_EVENT, RESPONSE_EVENT } = require("./constants");
const EventEmitter = require("events");
const client = new EventEmitter();
const readline = require("readline");
const todoserver = require("./todo-server")(client);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let operation, args;
rl.on("line", (input) => {
  [operation, ...args] = input.split(" ");
  client.emit(OPERATION_EVENT, operation, args);
});

todoserver.on(RESPONSE_EVENT, (resp) => {
  if (typeof resp == "object") {
    console.table(resp);
  } else {
    process.stdout.write(resp);
  }
  process.stdout.write("\n");
});

module.exports = this;
