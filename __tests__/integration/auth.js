process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');

let user1, user2;
//Insert 2 users before each test
beforeEach(async function () {
  await db.query(`
    CREATE TABLE users
    (
      username text PRIMARY KEY,
      password text NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      email text NOT NULL UNIQUE,
      photo_url text DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Default_profile_picture_%28male%29_on_Facebook.jpg/600px-Default_profile_picture_%28male%29_on_Facebook.jpg',
      is_admin boolean NOT NULL default false
    )
  `)
});


//Test create user route
describe('POST /auth/login', () => {
  it('should correctly create a new user and return it', async function () {
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
afterEach(async function () {
  await db.query(`DROP TABLE users;`);
});

//Close db connection
afterAll(async function () {
  await db.end();
});
