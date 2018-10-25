const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');
// const newUserSchema = require('../schema/newUser.json');
// const updateUserSchema = require('../schema/updateUser.json');

//Get a filtered list of users
router.get('/', async function(req, res, next) {
  try {
    const users = await User.getUsers();
    return res.json({ users });
  } catch (error) {
    return next(error);
  }
});

//Create a new user
router.post('/', async function(req, res, next) {
  try {
    const user = await User.createUser(req.body);
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

// //Get a user by id
// router.get('/:id', async function(req, res, next) {
//   try {
//     const user = await User.getUser(req.params.id);
//     return res.json({ user });
//   } catch (error) {
//     return next(error);
//   }
// });

// //Update a user
// router.patch('/:id', validateInput(updateUserSchema), async function(
//   req,
//   res,
//   next
// ) {
//   try {
//     let user = await User.getUser(req.params.id);
//     user.updateFromValues(req.body);
//     await user.save();
//     return res.json({ user });
//   } catch (error) {
//     return next(error);
//   }
// });

// //Delete a user
// router.delete('/:id', async function(req, res, next) {
//   try {
//     const userToDelete = await User.getUser(req.params.id);
//     const message = await userToDelete.deleteUser();
//     return res.json({ message });
//   } catch (error) {
//     return next(error);
//   }
// });

module.exports = router;
