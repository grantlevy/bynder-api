const fs = require('fs');
require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');

const GraphQLDate = require('./graphql_date.js');
const about = require('./about.js');
const course = require('./course.js');
const assignment = require('./assignment.js');
const grade = require('./grade.js');
const lecture = require('./lecture.js');
const note = require('./note.js');
const discussion = require('./discussion.js');
const post = require('./post.js');
const register = require('./register.js');

const resolvers = {
  Query: {
    about: about.getMessage,
    courseList: course.list,
    course: course.get,
    assignmentList: assignment.list,
    assignment: assignment.get,
    gradesList: grade.list,
    grade: grade.get,
    lecturesList: lecture.list,
    lecture: lecture.get,
    notesList: note.list,
    note: note.get,
    discussionList: discussion.list,
    discussion: discussion.get,
    postList: post.list,
    post: post.get,
    userList: register.userList,
    antiUserList: register.antiUserList,
    listWithGrades: assignment.listWithGrades,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    courseAdd: course.add,
    courseUpdate: course.update,
    courseDelete: course.delete,
    courseAddStudent: course.addStudent,
    courseRemoveStudent: course.removeStudent,
    assignmentAdd: assignment.add,
    assignmentUpdate: assignment.update,
    assignmentDelete: assignment.delete,
    noteAdd: note.add,
    noteUpdate: note.update,
    noteDelete: note.delete,
    lectureAdd: lecture.add,
    lectureUpdate: lecture.update,
    lectureDelete: lecture.delete,
    discussionAdd: discussion.add,
    discussionUpdate: discussion.update,
    discussionDelete: discussion.delete,
    postAdd: post.add,
    postUpdate: post.update,
    postDelete: post.delete,
    userAdd: register.add,
    login: register.login,
    gradeAdd: grade.add,
    gradeUpdate: grade.update,
    gradeDelete: grade.delete,
  },
  GraphQLDate,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
  resolvers,
  formatError: (error) => {
    console.log(error);
    return error;
  },
  playground: true,
  introspection: true,
});

function installHandler(app) {
  const enableCors = (process.env.ENABLE_CORS || 'true') === 'true';
  console.log('CORS setting:', enableCors);
  server.applyMiddleware({ app, path: '/graphql', cors: enableCors });
}

module.exports = { installHandler };
