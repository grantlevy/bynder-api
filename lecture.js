const { UserInputError } = require('apollo-server-express');
const { getDb, getNextLectureSequence } = require('./db.js');

async function get(_, { id }) {
  const db = getDb();
  const lecture = await db.collection('lectures').findOne({ id });
  return lecture;
}

async function list(_, { id }) {
  const db = getDb();

  const lectures = await db.collection('lectures').find({ course: id }).toArray();
  return lectures;
}

function validate(lecture) {
  const errors = [];
  if (lecture.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (lecture.notes.length < 3) {
    errors.push('Field "notes" must be at least 3 characters long.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { lecture }) {
  const db = getDb();
  validate(lecture);
  const newLecture = Object.assign({}, lecture);
  newLecture.id = await getNextLectureSequence('lectures');

  const result = await db.collection('lectures').insertOne(newLecture);
  const savedLecture = await db.collection('lectures').findOne({ _id: result.insertedId });
  return savedLecture;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.title || changes.lectureDate || changes.notes) {
    const lecture = await db.collection('lectures').findOne({ id });
    Object.assign(lecture, changes);
    validate(lecture);
  }
  await db.collection('lectures').updateOne({ id }, { $set: changes });
  const savedLecture = await db.collection('lectures').findOne({ id });
  return savedLecture;
}

async function remove(_, { id }) {
  const db = getDb();
  const lecture = await db.collection('lectures').findOne({ id });
  if (!lecture) return false;
  lecture.deleted = new Date();

  let result = await db.collection('deleted_lectures').insertOne(lecture);
  if (result.insertedId) {
    result = await db.collection('lectures').removeOne({ id });
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
};
