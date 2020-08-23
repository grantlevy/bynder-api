const { UserInputError } = require('apollo-server-express');
const { getDb, getNextSequence } = require('./db.js');

async function get(_, { id }) {
  const db = getDb();
  const course = await db.collection('courses').findOne({ id });
  return course;
}

async function list(_, { semester, userId }) {
  const db = getDb();
  const filter = {};
  const user = await db.collection('users').findOne({ id: userId });
  if (semester) {
    const returnedCourses = await db.collection('courses').find({ semester: semester, id: { $in: user.courses } }).toArray();
    return returnedCourses;
  };
  const returnedCourses = await db.collection('courses').find({ id: { $in: user.courses } } ).toArray();
  return returnedCourses;
}

function validate(course) {
  const errors = [];

  if (course.name.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (course.courseID.length < 3) {
    errors.push('Field "course ID" must be at least 3 characters long.');
  }

  if (course.semester.length < 3) {
    errors.push('Field "semester" must be at least 3 characters long.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { course, educatorId }) {
  const db = getDb();
  validate(course);
  const newCourse = Object.assign({}, course);
  newCourse.id = await getNextSequence('courses');

  const result = await db.collection('courses').insertOne(newCourse);
  const savedCourse = await db.collection('courses').findOne({ _id: result.insertedId });
  await db.collection('users').updateOne({ id: educatorId }, { $push: { courses: newCourse.id } });

  return savedCourse;
}

async function addStudent(_, { course, student }) {
  const db = getDb();

  const user = await db.collection('users').findOne({ id: student });
  const foundCourse = await db.collection('courses').findOne({ id: course });

  if (foundCourse === null || user === null) {
    return false;
  }

  await db.collection('users').updateOne({ id: student }, { $push: { courses: course } });

  return user;
}

async function removeStudent(_, { course, student }) {
  const db = getDb();

  const user = await db.collection('users').findOne({ id: student });
  const foundCourse = await db.collection('courses').findOne({ id: course });

  if (foundCourse === null || user === null) {
    return false;
  }
  await db.collection('users').updateOne({ id: student }, { $pull: { courses: course } });

  return user;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.name || changes.courseID || changes.semester || changes.status
    || changes.description) {
    const course = await db.collection('courses').findOne({ id });
    Object.assign(course, changes);
    validate(course);
  }
  await db.collection('courses').updateOne({ id }, { $set: changes });
  const savedCourse = await db.collection('courses').findOne({ id });
  return savedCourse;
}

async function remove(_, { id }) {
  const db = getDb();
  const course = await db.collection('courses').findOne({ id });
  if (!course) return false;
  course.deleted = new Date();

  let result = await db.collection('deleted_courses').insertOne(course);
  if (result.insertedId) {
    result = await db.collection('courses').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

module.exports = {
  list,
  add,
  get,
  update,
  delete: remove,
  addStudent,
  removeStudent,
};
