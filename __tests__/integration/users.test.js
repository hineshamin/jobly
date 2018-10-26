process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');
const Application = require('../../models/application');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');

let job1,
  job2,
  company1,
  company2,
  user1,
  user2,
  user3,
  application1,
  application2,
  application3,
  userToken;
//Insert 2 users before each test
beforeEach(async function() {
  //adding companies and related users for those companies to test
  //build up our test tables
  await createTables();
  ({
    company1,
    company2,
    job1,
    job2,
    user1,
    user2,
    application1,
    application2
  } = await insertTestData());
  const response = await request(app)
    .post('/users')
    .send({
      username: 'georgetheman',
      password: 'georgeisawesome',
      first_name: 'george',
      last_name: 'johnson',
      email: 'george@gmail.com'
    });
  user3 = await User.getUser('georgetheman');
  userToken = response.body.token;

  await request(app)
    .post(`/jobs/${job1.id}/apply`)
    .send({ state: 'applied' })
    .query({ _token: userToken });
});

//Test get users route
describe('GET /users', () => {
  it('should correctly return a list of users', async function() {
    const response = await request(app).get('/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(3);
    expect(response.body.users[0]).toHaveProperty('_username', user1.username);
  });
});

//Test create user route
describe('POST /users', () => {
  it('should correctly create a new user and return it', async function() {
    const response = await request(app)
      .post('/users')
      .send({
        username: 'bobcat',
        password: 'bob',
        first_name: 'bob',
        last_name: 'johnson',
        email: 'bob@gmail.com'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');

    const invalidResponse = await request(app)
      .post('/users')
      .send({
        username: 'bobcat',
        password: 'bob',
        first_name: 'bob',
        last_name: 'johnson',
        email: 'bob.com'
      });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test get one user route
describe('GET /users/:username', () => {
  it('should correctly return a user by username', async function() {
    const response = await request(app)
      .get(`/users/${user3.username}`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.user).toEqual({
      _username: 'georgetheman',
      first_name: 'george',
      last_name: 'johnson',
      email: 'george@gmail.com',
      photo_url:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Default_profile_picture_%28male%29_on_Facebook.jpg/600px-Default_profile_picture_%28male%29_on_Facebook.jpg',
      jobs: [
        {
          _id: 1,
          title: 'CEO',
          salary: 1123000,
          equity: 0.7,
          company_handle: 'AAPL',
          date_posted: expect.any(String),
          state: 'applied'
        }
      ]
    });
  });
});

//Test updating a user route
describe('PATCH /users/:username', () => {
  it('should correctly update a user and return it', async function() {
    const response = await request(app)
      .patch(`/users/${user3.username}`)
      .send({
        first_name: 'Josephina'
      })
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.user._username).toBe(user3.username);
    expect(response.body.user.first_name).toBe('Josephina');

    const invalidResponse = await request(app)
      .patch(`/users/${user3.username}`)
      .send({
        first_name: 20,
        last_name: null,
        _token: userToken
      });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test deleting a user route
describe('DELETE /users/:username', () => {
  it('should correctly delete a user', async function() {
    const response = await request(app)
      .delete(`/users/${user3.username}`)
      .send({
        _token: userToken
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User Deleted');
  });
});

//Delete users and companies tables after each tets
afterEach(async function() {
  await dropTables();
});

//Close db connection
afterAll(async function() {
  await db.end();
});
