/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
const { UserInputError } = require('apollo-server-express');
const Validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, getNextUserSequence } = require('./db.js');

function validate(user) {
  const errors = [];

  if (user.firstName.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (user.lastName.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (Validator.isEmpty(user.password)) {
    errors.push('Password field is required.');
  }

  if (Validator.isEmpty(user.email)) {
    errors.push('Email field is required.');
  } else if (!Validator.isEmail(user.email)) {
    errors.push('Email is invalid.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function hashPassword(user) {
  const { password } = user;
  const saltRounds = 10;

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      resolve(hash);
    });
  });

  return hashedPassword;
}

async function add(_, { user }) {
  const db = getDb();

  const testUser = await db.collection('users').findOne({ email: user.email });

  if (testUser) {
    throw new UserInputError('Email already exists.');
  }

  validate(user);
  user.password = await hashPassword(user);

  const newUser = Object.assign({}, user);
  newUser.id = await getNextUserSequence('users');

  const result = await db.collection('users').insertOne(newUser);
  const savedUser = await db.collection('users').findOne({ _id: result.insertedId });

  return savedUser;
}

async function userList(_, { course }) {
  const db = getDb();

  const tempArr = [];
  tempArr.push(course);

  const returnedUsers = await db.collection('users').find({ courses: { $in: tempArr } }).toArray();

  return returnedUsers;
}

async function antiUserList(_, { course }) {
  const db = getDb();

  const tempArr = [];
  tempArr.push(course);

  const returnedUsers = await db.collection('users').find({ courses: { $nin: tempArr } }).toArray();

  return returnedUsers;
}

async function validatePassword(user, checkUser) {
  const passwordsMatch = await new Promise((resolve, reject) => {
    bcrypt.compare(user.password, checkUser.password, (err, isMatch) => {
      if (err) {
        throw err;
      } else if (!isMatch) {
        console.log('Password does not match!');
        resolve(isMatch);
      } else {
        console.log('Password matches!');
        resolve(isMatch);
      }
    });
  });

  return passwordsMatch;
}

async function createToken(user) {
  return jwt.sign({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    type: user.type,
    email: user.email,
    courses: user.courses,
  }, 'mysecret');
}

async function login(_, { user }) {
  const db = getDb();
  const checkUser = await db.collection('users').findOne({ email: user.email });

  if (!checkUser) {
    throw new UserInputError('Email does not exist.');
  }

  const passwordMatch = await validatePassword(user, checkUser);

  if (passwordMatch) {
    // const token = jwt.sign({ _id: checkUser._id }, 'mysecret');
    const token = await createToken(checkUser);
    const newValues = { token };
    await db.collection('users').updateOne({ email: user.email }, { $set: newValues });
    const savedUser = await db.collection('users').findOne({ email: user.email });
    return savedUser;
  }
  throw new UserInputError('Password is invalid.');
}

module.exports = {
  add,
  login,
  userList,
  antiUserList,
};
