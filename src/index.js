const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { id } = request.headers;

  const user = users.find((user) => user.id === id);

  if (!user) {
    return response.status(400).json({ error: 'User not found'})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const userAlreadyExists = users.find(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'Username already taken'})
  }

  users.push(newUser)

  return response.status(201).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.json(user);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(400).json({ error: 'Todo does not exists'})
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if (todoIndex <= -1) {
    return response.status(400).json({ error: 'Todo does not exists'})
  }

  user.todos.splice(todoIndex, 1)
  
  return response.status(201).json(user);
});

module.exports = app;