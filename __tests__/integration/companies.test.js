process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/user');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');

let job1, job2, company1, company2, userToken;
//Insert 2 jobs and commpanies before each test
beforeEach(async function() {
  //adding companies and related jobs for testing
  //build up our test tables
  await createTables();
  ({ company1, company2, job1, job2 } = await insertTestData());
  const response = await request(app)
    .post('/users')
    .send({
      username: 'bobcat',
      password: 'bob',
      first_name: 'bob',
      last_name: 'johnson',
      email: 'bob@gmail.com'
    });

  //make homeboy an admin
  await db.query(`
    UPDATE users SET is_admin = True WHERE username='bobcat';
    `);
  userToken = await User.authenticate({ username: 'bobcat', password: 'bob' });
});

//Test get filtered companies route
describe('GET /companies', () => {
  it('should correctly return a filtered list of companies', async function() {
    const response = await request(app)
      .get('/companies')
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.companies.length).toBe(2);
    expect(response.body.companies[0]).toHaveProperty(
      'handle',
      company1.handle
    );
    const response400 = await request(app)
      .get('/companies')
      .query({ min: 100, max: 1, _token: userToken });
    expect(response400.statusCode).toBe(400);

    //test no token - unauthorized
    const response401 = await request(app)
      .get('/companies')
      .query({ _token: 'BADTOKEN' });
    expect(response401.statusCode).toBe(401);
  });
});

//Test create company route
describe('POST /companies', () => {
  it('should correctly create a new company and return it', async function() {
    const response = await request(app)
      .post('/companies')
      .send({
        handle: 'NFLX',
        name: 'Netflix',
        num_employees: 5000,
        description: 'American media services provider',
        logo_url: 'http://netflix.com'
      })
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.company._handle).toBe('NFLX');

    const invalidResponse = await request(app)
      .post('/companies')
      .send({
        handle: 'NFLX',
        name: 'Netflix',
        num_employees: '5000',
        description: 'American media services provider',
        logo_url: 'bogusurl'
      })
      .query({ _token: userToken });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test get one company route
describe('GET /companies/:handle', () => {
  it('should correctly return a company by handle', async function() {
    const response = await request(app)
      .get(`/companies/${company1.handle}`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.company._handle).toBe(company1.handle);

    //test that company contains an array of jobs on it's key of jobs
    expect(response.body.company.jobs.length).toBe(1);

    //test unauthorized
    const response401 = await request(app)
      .get(`/companies/${company1.handle}`)
      .query({ _token: 'BADTOKEN' });
    expect(response401.statusCode).toBe(401);
  });
});

//Test updating a company route
describe('PATCH /companies/:handle', () => {
  it('should correctly update a company and return it', async function() {
    const response = await request(app)
      .patch(`/companies/${company1.handle}`)
      .send({
        name: 'PEACH'
      })
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.company._handle).toBe(company1.handle);
    expect(response.body.company.name).toBe('PEACH');

    const invalidResponse = await request(app)
      .patch(`/companies/${company1.handle}`)
      .send({
        num_employees: 'PEACH',
        name: 500
      })
      .query({ _token: userToken });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test deleting a company route
describe('DELETE /companies/:handle', () => {
  it('should correctly delete a company', async function() {
    const response = await request(app)
      .delete(`/companies/${company1.handle}`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Company Deleted');
  });
});

//Delete companies after each tets
afterEach(async function() {
  await dropTables();
});

//Close db connection
afterAll(async function() {
  await db.end();
});
