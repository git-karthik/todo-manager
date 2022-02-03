# todo-manager

Personal task manager app

1. Clone the source code to local file system
2. Run `npm install`
3. Run `node .`

When the application is loaded the app data is initialized from the resources/todos.json. If the file is not empty, the data is loaded to the app memory.

The following commands are supported

- help
  - Guides on the commands supported
- add
  - add <task description>
    Adds the task to the todo list. By default the task is incomplete(i.e., status `false`)
- rm
  - rm <task id>
    Removes the task from the task list
- read
  - read <task id>
    Marks the task item as complete(i.e., status `true`)
- unread
  - unread <task id>
    Marks the task item as incomplete(i.e., status `false`)
- stash
  - stash
    Saves the task data to filesystem
- shutdown
  - shutdown
    Saves the application state, task data to filesystem and exits.
