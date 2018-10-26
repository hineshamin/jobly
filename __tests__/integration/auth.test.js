process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');
const { createTables, dropTables } = require('../../test_helpers/setup');

beforeEach(async function() {
  await createTables();
});

//Test create user route
describe('POST /auth/login', () => {
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
    const tokenRes = await request(app)
      .post('/login')
      .send({
        username: 'bobcat',
        password: 'bob'
      });
    expect(tokenRes.statusCode).toBe(200);
    expect(tokenRes.body).toHaveProperty('token');
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
