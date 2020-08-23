const { UserInputError } = require('apollo-server-express');
const { getDb, getNextPostSequence } = require('./db.js');

async function get(_, { id }) {
  const db = getDb();
  const post = await db.collection('posts').findOne({ id });
  return post;
}

async function list(_, { discussion }) {
  const db = getDb();
  const posts = await db.collection('posts').find({ discussion }).toArray();
  return posts;
}

function validate(post) {
  const errors = [];
  if (post.postBody.length < 3) {
    errors.push('Post must be at least 3 characters long.');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function add(_, { post }) {
  const db = getDb();
  validate(post);
  const newPost = Object.assign({}, post);
  newPost.id = await getNextPostSequence('posts');
  const result = await db.collection('posts').insertOne(newPost);
  const savedPost = await db.collection('posts').findOne({ _id: result.insertedId });
  return savedPost;
}

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.postBody) {
    const post = await db.collection('posts').findOne({ id });
    Object.assign(post, changes);
    validate(post);
  }
  await db.collection('posts').updateOne({ id }, { $set: changes });
  const savedPost = await db.collection('posts').findOne({ id });
  return savedPost;
}

async function remove(_, { id }) {
  const db = getDb();
  const post = await db.collection('posts').findOne({ id });
  if (!post) return false;
  post.deleted = new Date();

  let result = await db.collection('deleted_post').insertOne(post);
  if (result.insertedId) {
    result = await db.collection('posts').removeOne({ id });
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
