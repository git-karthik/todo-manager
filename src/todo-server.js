const EventEmitter = require("events");
const fs = require("fs/promises");
const path = require("path");

const {
  RESPONSE_EVENT,
  OPERATION_EVENT,
  OPERATIONS_HELP,
} = require("./constants");
class TodoServer extends EventEmitter {
  constructor(todoClient) {
    if (!todoClient) {
      throw new Error("Invalid client injection..");
    }
    super();
    this.todos = {};
    this.todoId = 100;

    todoClient.on(OPERATION_EVENT, (operation, args) => {
      switch (operation) {
        case "add":
        case "rm":
        case "ls":
        case "read":
        case "help":
        case "stash":
          this[operation](args);
          break;
        default:
          this.emit(
            RESPONSE_EVENT,
            "Unknown operation. Please try add | rm | ls | read. Try -help for more info.."
          );
      }
    });
  }

  help() {
    this.emit(RESPONSE_EVENT, OPERATIONS_HELP);
  }

  add(args) {
    this.todos[this.todoId] = {};
    this.todos[this.todoId].task = args.join(" ");
    this.todos[this.todoId].taskComplete = false;
    this.emit(RESPONSE_EVENT, `Todo task ${this.todoId} added successfully`);
    this.todoId++;
  }

  rm(args) {
    if (args.length == 0 || !this.todos[args[0]]) {
      this.emit(
        RESPONSE_EVENT,
        "No items found to remove.. skipping operation"
      );
      return;
    }

    delete this.todos[args[0]];
    this.emit(RESPONSE_EVENT, `Todo task ${args[0]} removed successfully`);
  }

  ls() {
    this.emit(RESPONSE_EVENT, this.todos);
  }

  read(args) {
    if (args.length == 0 || !this.todos[args[0]]) {
      this.emit(RESPONSE_EVENT, "No items found to read.. skipping operation");
      return;
    }

    this.todos[args[0]].taskComplete = true;
    this.emit(RESPONSE_EVENT, `Todo task ${args[0]} marked as complete...`);
  }

  stash() {
    // fs.mkdir(path.resolve("./resources"));
    // fs.fs
    //   .appendFile(
    //     path.resolve("./resources/todos.json"),
    //     JSON.stringify(this.todos)
    //   )
    //   .then(
    //     (value) => {
    //       console.info(value);
    //     },
    //     (err) => {
    //       console.error("Error response");
    //     }
    //   );
  }
}

module.exports = (todoClient) => new TodoServer(todoClient);
