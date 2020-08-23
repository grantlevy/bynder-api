# Bynder API

## Team Members
* Grant Levy
* Ankita Kunadia 
* Ryan Leys

## Relevant Links
* [API Deployment](http://api-bynder.herokuapp.com/graphql)
* [UI Repository](https://github.com/grantlevy/bynder-ui)
* [UI Deployment](http://ui-bynder.herokuapp.com)

## Project Overview
Bynder intends to be an all-in-one course management web application. The overall goal is to allow for educators to sign up, create courses and all relevant course material (i.e. syllabus, assignments, lectures). Students are then able to view all courses they're signed up for and can easily navigate the content in a manner that is improved from currently used tools.

Upon delivery of the final project, the app functions as follows:
1. Educators register an account and login to their new account, seeing a message to start by creating courses.
2. Students register an account and login to their new account, **seeing empty courses as they have not been assigned to any**.
3. Educators can create a new course and see a list of Students who they can add to their course.
4. Once a student is added to a course, they have the ability to click into the course and see assignments, lectures, and notes attached to the course. They also have the ability to create discussion posts within the course.
5. Educators can add assignments, lectures, notes, and discussions that will be available to view from the student's perspective.
6. More courses can be added with different student designations to show how the app responds dynamically to the user who is logged in.
7. Clicking on the user name allows for easy log out and changing of user accounts.
8. Two test accounts have been created with the following email and passwords: `educator@test.com, educator` and `student@test.com, student`, but the app supports new user creation.

## Project Milestones
This project was developed in a repository on Northeastern's Github.

<details><summary>Iteration 1</summary>
The main goal of this iteration was to implement functionality around courses and associated assignments. We figured if we could display a course list and navigate on click to an assignment list, it would be easy to duplicate this functionality for additional course information for future iterations.

For the API portion of this project, we successfully built connections in MongoDB that were queried appropriately by the API with built in queries and mutations. We currently have collections for `students`, `educators`, `institutions`, `courses`, and `assignments`, which get initialized through the `init.mongo.js` script. Many of these contain references to other collections to retain a notion of assignment (i.e. students take select courses, assignments are related to courses, etc.).

The code for iteration 1 has been tagged.
</details>

<details><summary>Iteration 2</summary>
With the framework of the app laid in Iteration 1, we spent the majority of Iteration 2 adding more functionality around courses, including lectures, notes and discussions by course. The idea is that a user will be signed up for/teaching a course and has the ability to click on a course and see all relevant aspects of the course. We now support assignments, grades, lectures, notes, and discussions, with the ability to fully create, read, update, and delete courses, assignments, lectures, and notes.

To include these changes in the API, we've built out CRUD operations for each of the courses, assignments, lectures, and notes. These APIs tie directly into the UI to get called fluidly and provide a seamless experience when working within the application. We added collections for `lectures`, `notes`, and `discussions`, which get initialized through the `init.mongo.js` script.

The code for iteration 2 will be tagged.
</details>

<details><summary>Iteration 3</summary>
Iteration 3 was primarily focused on user authentication and fully developing both sides of our application. We wanted to give the ability to create both "Student" and "Educator" type accounts with key differences in the functionality they're allowed within the application.

First, we fully developed our own authentication system rather than relying on Google OAuth. We built APIs that allow for both the registration and logging in of a user. This required building separate API functions to validate a new account's input are correct, hash a password using `bcrypt` (to avoid storing plaintext passwords in Mongo), validating password when logged in by comparing hashed passwords, and creating a jwt token with details to start a session when logged in that persists through refreshes. We also added list functionality to pull users who are both in and out of courses, which gets utilized by the Educator when assigning Students to their courses.

We also expanded upon our APIs for other app functionality, particularly around the Discussions section. We wanted to allow users to create and respond to posts, but only have edit capabilities for ones they were the author of. We also needed to show information like the name of the authors who posted, which required backend changes to manage. For courses, Educators automatically get assigned to the course upon creation, which then allows them to assign Students who will then be able to see the course information as they get added.
</details>

### Screenshots
<table>
  <tr>
    <td width="100%" valign="center"><img src="/readme_images/iter02_1.png" /></td>
  </tr>
  <tr>
    <td width="100%" valign="center"><img src="/readme_images/iter02_2.png" /></td>
  </tr>
</table>
