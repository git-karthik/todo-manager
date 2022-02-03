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
        case "unread":
        case "help":
        case "stash":
        case "shutdown":
        case "init":
          this[operation](args);
          break;
        default:
          this.emit(
            RESPONSE_EVENT,
            "Unknown operation. Please try add | rm | ls | read. Try -help for more info.."
          );
      }
    });

    this.init();

    this.on("init", (fileHandle) => {
      fileHandle.close();
      console.log("App data initialization complete");
    });

    this.on("shutdown", () => {
      console.info("Application shutting down.. Good bye!!!");
      setTimeout(() => {
        process.exit(0);
      }, 2000);
    });
  }

  help() {
    this.emit(RESPONSE_EVENT, OPERATIONS_HELP);
  }

  shutdown() {
    this.stash()
      .then((value) => {
        console.log(value);
        this.emit("shutdown");
      })
      .catch((err) => console.error(err));
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

  unread(args) {
    if (args.length == 0 || !this.todos[args[0]]) {
      this.emit(RESPONSE_EVENT, "No items found to read.. skipping operation");
      return;
    }

    this.todos[args[0]].taskComplete = false;
    this.emit(RESPONSE_EVENT, `Todo task ${args[0]} marked as incomplete...`);
  }

  async _fileRead(fileHandle) {
    try {
      let stats = await fileHandle.stat();
      if (stats.size != 0) {
        //read file to json object and append before writing it.
        let _fileData = await fileHandle.readFile({ encoding: "utf-8" });
        this.todos = JSON.parse(_fileData.toString());
        let lastKey = Object.keys(this.todos).pop();
        this.todoId = Number(lastKey) + 1;
      }
    } catch (error) {
      console.error(error);
    }
  }

  stash() {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.resolve("./resources/todos.json"),
        JSON.stringify(this.todos)
      )
        .then(() => {
          resolve("Todos saved successfully");
        })
        .catch((err) => reject(err));
    });
  }

  init() {
    if (this._app_initialized) {
      console.warn("App data already initialized. Skipping operation");
      return;
    }
    fs.open(path.resolve("./resources/todos.json"), "a+")
      .then((fileHandle) => {
        this._fileRead(fileHandle)
          .then(() => {
            this.emit("init", fileHandle);
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        this._app_initialized = true;
        console.log("App data initialization triggered");
      });
  }
}

module.exports = (todoClient) => new TodoServer(todoClient);
