const { UserInputError } = require('apollo-server-express');
const { getDb, getNextNoteSequence } = require('./db.js');

async function get(_, { id }) {
  const db = getDb();
  const note = await db.collection('notes').findOne({ id });
  return note;
}

async function list(_, { id }) {
  const db = getDb();
  const notes = await db.collection('notes').find({ course: id }).toArray();
  return notes;
}

function validate(note) {
  const errors = [];
  if (note.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { note }) {
  const db = getDb();

  validate(note);
  const newNote = Object.assign({}, note);
  newNote.id = await getNextNoteSequence('notes');

  const result = await db.collection('notes').insertOne(newNote);
  const savedNote = await db.collection('notes').findOne({ _id: result.insertedId });
  return savedNote;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.title || changes.noteDate || changes.noteBody) {
    const note = await db.collection('notes').findOne({ id });
    Object.assign(note, changes);
    validate(note);
  }
  await db.collection('notes').updateOne({ id }, { $set: changes });
  const savedNote = await db.collection('notes').findOne({ id });
  return savedNote;
}

async function remove(_, { id }) {
  const db = getDb();
  const note = await db.collection('notes').findOne({ id });
  if (!note) return false;
  note.deleted = new Date();

  let result = await db.collection('deleted_note').insertOne(note);
  if (result.insertedId) {
    result = await db.collection('notes').removeOne({ id });
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
