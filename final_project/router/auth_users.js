
const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');

const regd_users = express.Router();
let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  );
};

// Task 7: Login as a registered user
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({
      message: 'Invalid username or password.'
    });
  }

  const accessToken = jwt.sign(
    { username },
    'fingerprint_customer',
    { expiresIn: '1h' }
  );

  req.session.authorization = {
    accessToken,
    username
  };

  return res.status(200).json({
    message: 'User successfully logged in.',
    token: accessToken
  });
});

// Task 8: Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found.'
    });
  }

  const username = req.session.authorization.username;
  const review = req.query.review;

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'Please provide a review using the review query parameter.'
    });
  }

  // Replaces this user's existing review or adds a new one
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: 'Review added or updated successfully.'
  });
});

// Task 9: Delete the logged-in user's review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: 'Book not found.'
    });
  }

  const username = req.session.authorization.username;

  if (!Object.prototype.hasOwnProperty.call(
    books[isbn].reviews, username
  )) {
    return res.status(404).json({
      message: 'No review found for this user.'
    });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully.'
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
