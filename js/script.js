// FUNCTION: Select Elements by Id
const el = elm => document.getElementById(elm);

//Selecting DOM Elements............................................................................
const form = el('todoForm');
const addTodoInput = el('addTodoField');
const todoList = el('todos');
const todosRemainingContainer = el('ItemsLeft');
const completedTodos = el('completed');
const completedTodosContainer = el('completedTodos');
const toggleTodos = document.querySelectorAll('.toggle_todos');
const todoFooter = document.querySelector('.todo-footer');

//CSS class variables declaration........................................................................
var check = 'fa-check-circle';
var uncheck = 'fa-circle';
var lineThrough = 'line-through';

//StartIndex for the drag and drop feature
let startDragIndex;



// CLASS: to create a todo...............................................................................
class Todo {
    constructor(todo) {
        this.todo = todo;
        this.id = Math.random();
        this.done = false;
    }
}

//LOCAL STORAGE.........................................................................
//FUNCTION Set Local Storage
function setLocalStorage(items) {
    localStorage.setItem('TodoApp.todos', JSON.stringify(items));
}
//FUNCTION: Retrieve todos from local storage.....................................................
function getTodosFromLS() {
    let todos;
    if (localStorage.getItem('TodoApp.todos') === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem('TodoApp.todos'));
    }
    return todos;
}

//FUNCTION: Add todos to local storage...................................................................
function addTodosToLS(todo) {
    let todos = getTodosFromLS();
    todos.push(todo);
    setLocalStorage(todos);
}

//FUNCTION: Display todos form local storage to the UI.........................................................
function displayTodos() {
    let todos = getTodosFromLS();
    todos.forEach(todo => {
        addTodos(todo);
    });
}

//FUNCTION: Delete todos from local storage.........................................................
function deleteTodosFromLS(id) {
    let todos = getTodosFromLS();
    todos.forEach((todo, index) => {
        if (todo.id === id) {
            todos.splice(index, 1);
        }
    });
    setLocalStorage(todos);
}
let index = -1;
//FUNCTION: Add Todos to the UI....................................................................
function addTodos(todo) {
    index++;
    var complete = todo.done ? check : uncheck;
    var line_through = todo.done ? lineThrough : '';

    var todoElm = `
    <li draggable="true" class="draggable" data-index="${index}">
        <div class = "item">
          <div>
          <span hidden>${todo.id}</span>
            <i class="far ${complete} check" job="complete" id="${todo.id}"></i>
            <span id="todoText" class="${line_through}">${todo.todo}</span>
          </div>
          <div class="delete">
            <img src="images/icon-cross.svg" alt=""  job="deleteTodo" id="${todo.id}" class="trash">
          </div>
          </div>
        </li>
    `
    const position = 'beforeend';
    todoList.insertAdjacentHTML(position, todoElm);
    const todoItems = todoList.querySelectorAll('.draggable');
    addEvents(todoItems);
}

// FUNCTION: Mark completed todos.............................................................
function completeTodos(id, ClickedTodo) {
    ClickedTodo.classList.toggle(check);
    ClickedTodo.classList.toggle(uncheck);
    const todo = ClickedTodo.closest("li");
    const todoText = todo.querySelector('#todoText');
    todoText.classList.toggle(lineThrough);
    let todos = getTodosFromLS();
    todos.forEach(todo => {
        if (todo.id === id) {
            todo.done = todo.done ? false : true;
            setLocalStorage(todos);
        }
    });
}


//EVENTS
//Form Submit Event.....................................................................................
form.addEventListener('submit', (e) => {
    e.preventDefault();
    var todo = addTodoInput.value;
    if (!todo) return;
    const newTodo = new Todo(todo);
    addTodos(newTodo);
    addTodosToLS(newTodo);
    getRemainingTodos();
    addTodoInput.value = "";
});

//Todo container Event................................................................................
todoList.addEventListener('click', (e) => {
    if (e.target.classList.contains('trash')) {
        const todo = e.target.closest('li');
        const id = todo.querySelector('span').textContent;
        todo.classList.add('fall');
        todo.addEventListener('transitionend', () => {
            todo.remove();
        });
        deleteTodosFromLS(Number(id));
        getRemainingTodos();
    } else if (e.target.classList.contains('check')) {
        const ClickedTodo = e.target;
        const todo = ClickedTodo.closest('li');
        const id = todo.querySelector('span').textContent;
        completeTodos(Number(id), ClickedTodo);
        getRemainingTodos();
    }
});

// Clear Completed Todos.....................................................................................
completedTodos.addEventListener('click', () => {
    todoList.innerHTML = '';
    let todos = getTodosFromLS();
    const unCompletedTodos = todos.filter(todo => todo.done === false);
    unCompletedTodos.forEach(unCompletedTodo => {
        addTodos(unCompletedTodo);
    });
    setLocalStorage(unCompletedTodos);
});


//FUNCTION: Show uncompleted todos....................................................................
function getRemainingTodos() {
    let todos = getTodosFromLS();
    const todosRemaining = todos.filter(todoRemaining => todoRemaining.done === false);
    todosRemainingContainer.innerHTML = '<p>' + todosRemaining.length + ' todo(s) left</p>';
}

//FUNCTION: Show all todos.................................................................................
function showAllTodos() {
    todoList.innerHTML = '';
    let todos = getTodosFromLS();
    todos.forEach(todo => {
        addTodos(todo);
    });
}

//FUNCTION: Show active todos..................................................................................
function showActiveTodos() {
    todoList.innerHTML = '';
    let todos = getTodosFromLS();
    const activeTodos = todos.filter(activeTodo => activeTodo.done === false);
    activeTodos.forEach(activeTodo => {
        addTodos(activeTodo);
    });
}
//FUNCTION: Show Completed todos only..................................................................................
function showCompletedTodos() {
    todoList.innerHTML = '';
    let todos = getTodosFromLS();
    const todosCompleted = todos.filter(todoCompleted => todoCompleted.done);
    todosCompleted.forEach(todoCompleted => {
        addTodos(todoCompleted);
    });
}


//FUNCTION: Remove active class from all, active and completed element................................................
function removeActive() {
    toggleTodos.forEach(toggleTodo => {
        toggleTodo.classList.remove('active');
    })
}
//Toggle active class btn the all, active and completed elements.............................................................
toggleTodos.forEach(toggleTodo => {
    toggleTodo.addEventListener('click', (e) => {
        removeActive();
        e.target.classList.add('active');
        if (e.target.classList.contains('completed')) {
            showCompletedTodos();
        } else if (e.target.classList.contains('allTodos')) {
            showAllTodos();
        } else if (e.target.classList.contains('activeTodos')) {
            showActiveTodos();
        }
    });
});


//Display Todos........................................................................................
document.addEventListener('DOMContentLoaded', () => {
    displayTodos();
    getRemainingTodos();
});

//DRAG AND DROP FUNCTIONALITY.............................................................

function addEvents(todoItems) {
    todoItems.forEach(todoItem => {
        todoItem.addEventListener('dragstart', dragStart);
        todoItem.addEventListener('dragleave', dragLeave);
        todoItem.addEventListener('dragenter', dragEnter);
        todoItem.addEventListener('dragover', dragOver);
        todoItem.addEventListener('drop', dragDrop);
    });
}

function dragStart() {
    startDragIndex = +this.getAttribute('data-index');
}

function dragLeave() {
    this.classList.remove('over');
}

function dragEnter() {
    this.classList.add('over');
}

function dragOver(e) {
    this.classList.add('over');
    e.preventDefault();
}

function dragDrop() {
    this.classList.remove('over');
    let endDragIndex = +this.getAttribute('data-index');
    swapTodoItems(startDragIndex, endDragIndex);
}

function swapTodoItems(fromIndex, toIndex) {
    let todoItems = todoList.querySelectorAll('.draggable');
    const todoItemOne = todoItems[fromIndex];
    const todoItemTwo = todoItems[toIndex];
    todoItems[fromIndex].append(todoItemTwo.querySelector('.item'));
    todoItems[toIndex].append(todoItemOne.querySelector('.item'));
}