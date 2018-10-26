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

//Test get filtered jobs route
describe('GET /jobs', () => {
  it('should correctly return a filtered list of jobs', async function() {
    const response = await request(app)
      .get('/jobs')
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.jobs.length).toBe(2);
    expect(response.body.jobs[0]).toHaveProperty('title', job1.title);
    expect(response.body.jobs[1]).toHaveProperty(
      'company_handle',
      job2.company_handle
    );

    //test unauthorized
    const response401 = await request(app)
      .get(`/jobs`)
      .query({ _token: 'BADTOKEN' });
    expect(response401.statusCode).toBe(401);
  });
});

//Test create job route
describe('POST /jobs', () => {
  it('should correctly create a new job and return it', async function() {
    const response = await request(app)
      .post('/jobs')
      .send({
        title: 'SOFTWARE DEVELOPER',
        salary: 5000,
        equity: 0.01,
        company_handle: 'GOOG'
      })
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.job.title).toBe('SOFTWARE DEVELOPER');

    const invalidResponse = await request(app)
      .post('/jobs')
      .send({
        title: 'SOFTWARE DEVELOPER',
        salary: 'FiveThousand',
        equity: 'janitorlevel',
        company_handle: 20
      })
      .query({ _token: userToken });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test get one job route
describe('GET /jobs/:id', () => {
  it('should correctly return a job by id', async function() {
    const response = await request(app)
      .get(`/jobs/${job1.id}`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.job._id).toBe(job1.id);

    //test unauthorized
    const response401 = await request(app)
      .get(`/jobs/${job1.id}`)
      .query({ _token: 'BADTOKEN' });
    expect(response401.statusCode).toBe(401);
  });
});

//Test updating a job route
describe('PATCH /jobs/:id', () => {
  it('should correctly update a job and return it', async function() {
    const response = await request(app)
      .patch(`/jobs/${job1.id}`)
      .send({
        title: 'WINDOW WASHER'
      })
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.job._id).toBe(job1.id);
    expect(response.body.job.title).toBe('WINDOW WASHER');

    const invalidResponse = await request(app)
      .patch(`/jobs/${job1.id}`)
      .send({
        title: 20,
        equity: 500
      })
      .query({ _token: userToken });
    expect(invalidResponse.statusCode).toBe(400);
  });
});

//Test deleting a job route
describe('DELETE /jobs/:id', () => {
  it('should correctly delete a job', async function() {
    const response = await request(app)
      .delete(`/jobs/${job1.id}`)
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Job Deleted');
  });
});

//Test creating an application
describe('POST /jobs/:id/apply', () => {
  it('should correctly create an application', async function() {
    const response = await request(app)
      .post(`/jobs/${job1.id}/apply`)
      .send({ state: 'applied' })
      .query({ _token: userToken });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('applied');
  });
});

//Delete jobs and companies tables after each tets
afterEach(async function() {
  await dropTables();
});

//Close db connection
afterAll(async function() {
  await db.end();
});
