process.env.NODE_ENV = 'test';
const Job = require('../../models/job');
const db = require('../../db');

let job1;
let job2;
let company1;
let company2;
//Insert 2 jobs before each test
beforeEach(async function () {
  //adding companies and related jobs for those companies to test

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

//Test get filtered jobs
describe('getFilteredJobs()', () => {
  it('should correctly return a filtered list of jobs', async function () {
    const jobs = await Job.getFilteredJobs({});
    expect(jobs.length).toEqual(2);
    expect(jobs[0]).toHaveProperty('id', job1.id);
    expect(jobs[1]).toHaveProperty('company_handle', job2.company_handle);
    const filteredJobsSalaryMin = await Job.getFilteredJobs({
      min_salary: 90000
    });
    expect(filteredJobsSalaryMin.length).toEqual(1);
    const filteredJobsEquityMin = await Job.getFilteredJobs({
      min_equity: 0.8
    });
    expect(filteredJobsEquityMin.length).toEqual(1);
    const filteredJobsSearch = await Job.getFilteredJobs({
      search: 'JAN'
    });
    expect(filteredJobsSearch.length).toEqual(1);
  });
});

//Test creating job
describe('createJob()', () => {
  it('should correctly add a job', async function () {
    const newJob = await Job.createJob({
      title: 'SOFTWARE DEVELOPER',
      salary: 5000,
      equity: 0.01,
      company_handle: 'GOOG',
    });
    expect(newJob).toHaveProperty('id');
    expect(newJob.salary).toEqual(5000);
    const jobs = await Job.getFilteredJobs({});
    expect(jobs.length).toEqual(3);
  });
});

//Test get one job
describe('getJob()', () => {
  it('should correctly return a job by id', async function () {
    const job = await Job.getJob(job1.id);
    expect(job.id).toEqual(job1.id);
    expect(job.salary).toEqual(job1.salary);

    //get a job that doesn't exist and check failure
    try {
      await Job.getJob(0);
    } catch (e) {
      expect(e.message).toMatch('Cannot find job by that id');
    }
  });
});

//Update a job test
describe('updateJob()', () => {
  it('should correctly update a job', async function () {
    const job = await Job.getJob(job1.id);
    job.title = 'WINDOW WASHER';

    const updatedJob = await job.updateJob();
    expect(updatedJob.title).toEqual('WINDOW WASHER');

    const jobs = await Job.getFilteredJobs({});
    expect(jobs.length).toEqual(2);

    expect(() => {
      job.id = 0;
    }).toThrowError(`Can't change job id!`);
  });
});

//Delete a job test
describe('deleteJob()', () => {
  it('should correctly delete a job', async function () {
    const jobtobeDeleted = await Job.getJob(job1.id);
    const message = await jobtobeDeleted.deleteJob();
    expect(message).toBe('Job Deleted');
  });
});

//Delete jobs and companies tables after each tets
afterEach(async function () {
  await db.query(`DELETE FROM jobs`);
  await db.query(`DELETE FROM companies`);
});

//Close db connection
afterAll(async function () {
  await db.end();
});
