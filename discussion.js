const { UserInputError } = require('apollo-server-express');
const { getDb, getNextDiscussionSequence } = require('./db.js');

async function get(_, { id }) {
  const db = getDb();
  const discussion = await db.collection('discussions').findOne({ id });
  return discussion;
}

async function list(_, { id }) {
  const db = getDb();
  const discussions = await db.collection('discussions').find({ course: id }).toArray();
  return discussions;
}

function validate(discussion) {
  const errors = [];
  if (discussion.title.length < 3) {
    errors.push('Field "title" must be at least 3 characters long.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { discussion }) {
  const db = getDb();

  validate(discussion);
  const newDiscussion = Object.assign({}, discussion);
  newDiscussion.id = await getNextDiscussionSequence('discussions');

  const result = await db.collection('discussions').insertOne(newDiscussion);
  const savedDiscussion = await db.collection('discussions').findOne({ _id: result.insertedId });
  return savedDiscussion;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.title || changes.postBody) {
    const discussion = await db.collection('discussions').findOne({ id });
    Object.assign(discussion, changes);
    validate(discussion);
  }
  await db.collection('discussions').updateOne({ id }, { $set: changes });
  const savedDiscussion = await db.collection('discussions').findOne({ id });
  return savedDiscussion;
}

async function remove(_, { id }) {
  const db = getDb();
  const discussion = await db.collection('discussions').findOne({ id });
  if (!discussion) return false;
  discussion.deleted = new Date();

  let result = await db.collection('deleted_discussion').insertOne(discussion);
  if (result.insertedId) {
    result = await db.collection('discussions').removeOne({ id });
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
