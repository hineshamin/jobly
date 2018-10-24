process.env.NODE_ENV = 'test';
const db = require('../../db');
const request = require('supertest');
const app = require('../../app');

let job1, job2, company1, company2;
//Insert 2 jobs before each test
beforeEach(async function () {
  //adding jobs and related jobs for those jobs to test

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
  company1 = result1.rows[0];
  company2 = result2.rows[0];
  job1 = result3.rows[0];
  job2 = result4.rows[0];
});

// //Test get filtered jobs route
// describe('GET /jobs', () => {
//   it('should correctly return a filtered list of jobs', async function () {
//     const response = await request(app).get('/jobs');
//     expect(response.statusCode).toBe(200);
//     expect(response.body.jobs.length).toBe(2);
//     expect(response.body.jobs[0]).toHaveProperty(
//       'handle',
//       company1.handle
//     );
//     const response400 = await request(app)
//       .get('/jobs')
//       .query({ min: 100, max: 1 });
//     expect(response400.statusCode).toBe(400);
//   });
// });

//Test create job route
describe('POST /jobs', () => {
  it('should correctly create a new job and return it', async function () {
    const response = await request(app)
      .post('/jobs')
      .send({
        title: 'SOFTWARE DEVELOPER',
        salary: 5000,
        equity: 0.01,
        company_handle: 'GOOG',
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.job.title).toBe('SOFTWARE DEVELOPER');

    // const invalidResponse = await request(app)
    //   .post('/jobs')
    //   .send({
    //     handle: 'NFLX',
    //     name: 'Netflix',
    //     num_employees: '5000',
    //     description: 'American media services provider',
    //     logo_url: 'bogusurl'
    //   });
    // expect(invalidResponse.statusCode).toBe(400);
  });
});

// //Test get one job route
// describe('GET /jobs/:handle', () => {
//   it('should correctly return a job by handle', async function () {
//     const response = await request(app).get(`/jobs/${company1.handle}`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body.job._handle).toBe(company1.handle);
//   });
// });

// //Test updating a job route
// describe('PATCH /jobs/:handle', () => {
//   it('should correctly update a job and return it', async function () {
//     const response = await request(app)
//       .patch(`/jobs/${company1.handle}`)
//       .send({
//         name: 'PEACH'
//       });
//     expect(response.statusCode).toBe(200);
//     expect(response.body.job._handle).toBe(company1.handle);
//     expect(response.body.job.name).toBe('PEACH');

//     const invalidResponse = await request(app)
//       .patch(`/jobs/${company1.handle}`)
//       .send({
//         num_employees: 'PEACH',
//         name: 500
//       });
//     expect(invalidResponse.statusCode).toBe(400);
//   });
// });

// //Test deleting a job route
// describe('DELETE /jobs/:handle', () => {
//   it('should correctly delete a job', async function () {
//     const response = await request(app).delete(`/jobs/${company1.handle}`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body.message).toBe('Company Deleted');
//   });
// });

//Delete jobs and companies tables after each tets
afterEach(async function () {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
});

//Close db connection
afterAll(async function () {
  await db.end();
});
