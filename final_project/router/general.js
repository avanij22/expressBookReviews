
const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');

const public_users = express.Router();

// Separate endpoint that provides the book data to Axios requests
public_users.get('/_internal/books', (req, res) => {
  res.status(200).json(books);
});

// Task 10: Get the list of all books using Axios and async/await
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/_internal/books');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Task 11: Get a book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/_internal/books');
    const isbn = req.params.isbn;
    const book = response.data[isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve book.' });
  }
});

// Task 12: Get books by author
public_users.get('/author/:author', async (req, res) => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/_internal/books');
    const author = req.params.author.toLowerCase();

    const result = Object.values(response.data).filter(
      book => book.author.toLowerCase() === author
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Task 13: Get books by title
public_users.get('/title/:title', async (req, res) => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/_internal/books');
    const title = req.params.title.toLowerCase();

    const result = Object.values(response.data).filter(
      book => book.title.toLowerCase().includes(title)
    );

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
});

// Get reviews for a book
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  const reviews = books[isbn].reviews;

  if (Object.keys(reviews).length === 0) {
    return res.status(200).json({ message: 'No reviews found for this book.' });
  }

  return res.status(200).json(reviews);
});

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  const isValid = require('./auth_users.js').isValid;
  const users = require('./auth_users.js').users;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'Username already exists.' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered.' });
});

module.exports.general = public_users;
