require('dotenv').config();
const { MongoClient } = require('mongodb');

let db;

async function connectToDb() {
  const url = process.env.DB_URL || 'mongodb+srv://test:test@bynder.uilwu.mongodb.net/bynder';
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

async function getNextSequence(name) {
  const result = await db.collection('countersCourses').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getNextAssignmentSequence(name) {
  const result = await db.collection('countersAssignments').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getNextNoteSequence(name) {
  const result = await db.collection('countersNotes').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getNextLectureSequence(name) {
  const result = await db.collection('countersLectures').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getNextPostSequence(name) {
  const result = await db.collection('countersPosts').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getNextDiscussionSequence(name) {
  const result = await db.collection('countersDiscussions').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getNextUserSequence(name) {
  const result = await db.collection('countersUsers').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function getNextGradeSequence(name) {
  const result = await db.collection('countersGrades').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function getDb() {
  return db;
}

module.exports = {
  connectToDb,
  getNextSequence,
  getDb,
  getNextAssignmentSequence,
  getNextLectureSequence,
  getNextNoteSequence,
  getNextPostSequence,
  getNextDiscussionSequence,
  getNextUserSequence,
  getNextGradeSequence,
};
