const { UserInputError } = require('apollo-server-express');
const { getDb, getNextAssignmentSequence } = require('./db.js');

async function get(_, { id }) {
  const db = getDb();
  const assignment = await db.collection('assignments').findOne({ id });
  return assignment;
}

async function list(_, { id }) {
  const db = getDb();

  const assignments = await db.collection('assignments').find({ course: id }).toArray();
  return assignments;
}

async function listWithGrades(_, { id, student }) {
  const db = getDb();

  const assignments = await db.collection('assignments').aggregate([
    {
      $match: {
        course: id,
      },
    },
    {
      $lookup:
      {
        from: 'grades',
        localField: 'id',
        foreignField: 'assignment',
        as: 'assignmentGrades',
      },
    },
    {
      $match: {
        'assignmentGrades.student': student,
      },
    },
  ]).toArray();

  return assignments;
}

function validate(assignment) {
  const errors = [];
  if (assignment.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { assignment }) {
  const db = getDb();
  validate(assignment);
  const newAssignment = Object.assign({}, assignment);
  newAssignment.id = await getNextAssignmentSequence('assignments');

  const result = await db.collection('assignments').insertOne(newAssignment);
  const savedAssignment = await db.collection('assignments').findOne({ _id: result.insertedId });
  return savedAssignment;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.title || changes.dueDate || changes.grade || changes.description) {
    const assignment = await db.collection('assignments').findOne({ id });
    Object.assign(assignment, changes);
    validate(assignment);
  }
  await db.collection('assignments').updateOne({ id }, { $set: changes });
  const savedAssignment = await db.collection('assignments').findOne({ id });
  return savedAssignment;
}

async function remove(_, { id }) {
  const db = getDb();
  const assignment = await db.collection('assignments').findOne({ id });
  if (!assignment) return false;
  assignment.deleted = new Date();

  let result = await db.collection('deleted_assignments').insertOne(assignment);
  if (result.insertedId) {
    result = await db.collection('assignments').removeOne({ id });
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
  listWithGrades,
};
