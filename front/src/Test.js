import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import * as R from 'ramda';

// composition helper
const combine = R.curry((c, o) => x => (<div>{c(x)} {o(x)}</div>));
const combineComponents = (...args) => {
  const [first, ...rest] = args;
  return R.reduce((acc, c) => combine(acc, c), first, rest);
};

// helpers
const targetValue = e => e.target.value;
const getTodos = R.prop('todos');

// redux utils
const createReducer = (init, handlers) =>
  (state = init, action) =>
    R.propOr(R.identity, R.prop('type', action), handlers)(state, action);

const addOne = R.add(1);
const getAllIds = R.pluck('id');
const getMax = R.reduce(R.max, 0);
const getNextId = R.compose(addOne, getMax, getAllIds);

// constants
const ADD_TODO = 'ADD_TODO';
const DELETE_TODO = 'DELETE_TODO';

// actions
const addTodo = text => ({ type: ADD_TODO, text });
const deleteTodo = id => ({ type: DELETE_TODO, id });

// reducers
const todos = createReducer([], {
  [ADD_TODO]: (state, action) => [
    { id: getNextId(state), completed: false, text: action.text },
    ...state
  ],
  [DELETE_TODO]: (state, action) => R.reject(R.propEq('id', action.id), state),
});

const year = createReducer('', {});
const title = createReducer('', {});

// combine reducer and create store
const reducers = combineReducers({ todos, year, title });

const initialState = {
  year: '2016',
  title: 'Random stuff',
  todos: [{ id: 1, text: 'foo' }, { id: 2, text: 'bar' }]
};

const store = createStore(reducers, initialState);

// components
const Header = title => <h1>A Todo List: {title}</h1>;
const Add = ({ onSave }) => (
  <div>
    <button onClick={() => onSave('foobar')}>Add</button>
  </div>
);
const List = items => <ul>{items}</ul>;
const Item = ({ todo, onDelete }) => (
  <li key={todo.id}>
    {todo.text} <button onClick={() => onDelete(todo.id)}>Remove</button>
  </li>
);
const Footer = text => <div>{text}</div>;

// define a bindActionCreator
const bindAction = R.curry((dispatch, actionCreator) =>
  R.compose(dispatch, actionCreator));

const bindActionCreator = bindAction(store.dispatch);

// map state to props
const TodoHeader = R.pipe(props => props.title, Header);

const TodoAdd = R.pipe(props => ({ onSave: props.dispatch(addTodo) }), Add);

const mapItems = ({ todos, onDelete }) =>
  R.map(todo => Item({ todo, onDelete }), todos);

const TodoList = R.pipe(props =>
  ({ todos: props.todos, onDelete: props.dispatch(deleteTodo) }),
  R.compose(List, mapItems)
);
const TodoFooter = R.pipe(props => props.year, Footer);

// combine all components
const App = combineComponents(TodoHeader, TodoAdd, TodoList, TodoFooter);

// we could also have used curry...
const getRender = node => app => ReactDOM.render(app, node);
const render = getRender(document.getElementById('root'));

const run = store.subscribe(() =>
  render(<App {...store.getState()} dispatch={bindActionCreator} />));

// start
const init = store.dispatch({ type: '@@INIT' });