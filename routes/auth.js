const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

// Login a user
router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;
    const user = await User.createUser(req.body);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});


module.exports = router;
