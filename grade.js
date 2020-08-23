/* eslint-disable array-callback-return */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */
const { getDb } = require('./db.js');

async function get(_, { id }) {
  const db = getDb();
  const grade = await db.collection('grades').findOne({ id });
  return grade;
}

async function list(_, { assignment, student }) {
  const db = getDb();

  if (student) {
    const grades = await db.collection('grades').find({ $and: [{ assignment }, { student }] }).toArray();
    return grades;
  }
  // const grades = await db.collection('grades').find({ assignment: assignment }).toArray();
  // db.users.aggregate([ { $lookup: { from: "grades", localField: "id", foreignField:  "student", as: "grade_lookup" } } ])

  const gradesTemp = await db.collection('users').aggregate([{
    $lookup: {
      from: 'grades', localField: 'id', foreignField: 'student', as: 'grade_lookup',
    },
  }]).toArray();


  const result = gradesTemp.filter((v) => {
    // eslint-disable-next-line no-unused-expressions
    v.grade_lookup.assignment === assignment;
  });
  return result;
}

async function add(_, { grade }) {
  const db = getDb();
  const newGrade = Object.assign({}, grade);
  newGrade.id = await getNextGradeSequence('grades');

  const result = await db.collection('grades').insertOne(newGrade);
  const savedGrade = await db.collection('grades').findOne({ _id: result.insertedId });
  return savedGrade;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.grade || changes.feedback) {
    const course = await db.collection('grades').findOne({ id });
    Object.assign(grade, changes);
  }
  await db.collection('grades').updateOne({ id }, { $set: changes });
  const savedGrade = await db.collection('grades').findOne({ id });
  return savedGrade;
}

async function remove(_, { id }) {
  const db = getDb();
  const grade = await db.collection('grades').findOne({ id });
  if (!grade) return false;
  grade.deleted = new Date();

  let result = await db.collection('deleted_grades').insertOne(grade);
  if (result.insertedId) {
    result = await db.collection('grades').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

module.exports = {
  list,
  get,
  add,
  update,
  delete: remove,
};
