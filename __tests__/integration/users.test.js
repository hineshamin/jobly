process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');

let job1, job2, company1, company2, user1, user2;
//Insert 2 users before each test
beforeEach(async function () {
  //adding companies and related users for those companies to test
  //build up our test tables
  await db.query(`
    CREATE TABLE companies
    (
      handle text PRIMARY KEY,
      name text NOT NULL UNIQUE,
      num_employees int,
      description text,
      logo_url text
    )
  `)
  await db.query(`      
    CREATE TABLE jobs
    (
      id SERIAL PRIMARY KEY,
      title text NOT NULL,
      salary float NOT NULL,
      equity float NOT NULL CHECK(equity BETWEEN 0 and 1),
      company_handle text REFERENCES companies ON DELETE cascade,
      date_posted TIMESTAMP default CURRENT_TIMESTAMP
    )
  `)
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
  let result1 = await db.query(`
  INSERT INTO companies (handle,name,num_employees,description,logo_url)
  VALUES ('AAPL','apple',123000,'Maker of hipster computers','http://www.apllogo.com')
  RETURNING handle,name,num_employees,description,logo_url
  `);
  let result2 = await db.query(`
  INSERT INTO companies (handle,name,num_employees,description,logo_url)
  VALUES ('GOOG','google',70000,'Search engine giant','http://www.google.com')
  RETURNING handle,name,num_employees,description,logo_url
  `);
  let result3 = await db.query(`
  INSERT INTO jobs (title,salary,equity,company_handle)
  VALUES ('CEO',1123000,0.7,'AAPL')
  RETURNING id, title,salary,equity,company_handle, date_posted
  `);
  let result4 = await db.query(`
  INSERT INTO jobs (title,salary,equity,company_handle)
  VALUES ('JANITOR',80000,0.9,'GOOG')
  RETURNING id,title,salary,equity,company_handle,date_posted
  `);
  let result5 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('joerocket', 'testpass', 'joe', 'smith', 'joe@gmail.com', True)
  RETURNING username, first_name, last_name, email, photo_url, is_admin`);
  let result6 = await db.query(`
  INSERT INTO users (username, password, first_name, last_name, email, is_admin)
  VALUES ('spongebob', 'garry', 'SpongeBob', 'SquarePants', 'sponge@gmail.com', False)
  RETURNING username, first_name, last_name, email, photo_url, is_admin`);
  company1 = result1.rows[0];
  company2 = result2.rows[0];
  job1 = result3.rows[0];
  job2 = result4.rows[0];
  user1 = result5.rows[0];
  user2 = result6.rows[0];
});

//Test get users route
describe('GET /users', () => {
  it('should correctly return a list of users', async function () {
    const response = await request(app).get('/users');
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(2);
    expect(response.body.users[0]).toHaveProperty('_username', user1.username);
  });
});

//Test create user route
describe('POST /users', () => {
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

    //make fake non-existent database reference to throw
    //error in route
    // try {
    //   await db.query(`DROP TABLE users`)
    //   const response = await request(app)
    //     .post('/users')
    //     .send({
    //       username: 'bobcat',
    //       password: 'bob',
    //       first_name: 'bob',
    //       last_name: 'johnson',
    //       email: 'bob@gmail.com'
    //     });
    // } catch (error) {
    //   console.log('got here!');
    //   expect(error.message).toMatch('Cannot create user');
    // }
    // await db.query(`CREATE TABLE users (
    //   username text PRIMARY KEY);`)
  });
});

//Test get one user route
describe('GET /users/:username', () => {
  it('should correctly return a user by username', async function () {
    const response = await request(app).get(`/users/${user1.username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.user._username).toBe(user1.username);

    //check try catch pattern of route
  });
});

//Test updating a user route
describe('PATCH /users/:username', () => {
  it('should correctly update a user and return it', async function () {
    const response = await request(app)
      .patch(`/users/${user1.username}`)
      .send({
        first_name: 'Josephina'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.user._username).toBe(user1.username);
    expect(response.body.user.first_name).toBe('Josephina');

    const invalidResponse = await request(app)
      .patch(`/users/${user1.username}`)
      .send({
        first_name: 20,
        last_name: null
      });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test deleting a user route
describe('DELETE /users/:username', () => {
  it('should correctly delete a user', async function () {
    const response = await request(app).delete(`/users/${user1.username}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User Deleted');
  });
});

//Delete users and companies tables after each tets
afterEach(async function () {
  await db.query(`DROP TABLE jobs;`);
  await db.query(`DROP TABLE companies;`);
  await db.query(`DROP TABLE users;`);
});

//Close db connection
afterAll(async function () {
  await db.end();
});
