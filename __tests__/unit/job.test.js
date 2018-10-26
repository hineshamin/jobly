process.env.NODE_ENV = 'test';
const Job = require('../../models/job');
const db = require('../../db');
const {
  createTables,
  insertTestData,
  dropTables
} = require('../../test_helpers/setup');

let job1, job2, company1, company2, user1, user2;
//Insert 2 users before each test
beforeEach(async function() {
  //adding companies and related users for those companies to test
  //build up our test tables
  await createTables();
  ({ company1, company2, job1, job2, user1, user2 } = await insertTestData());
});

//Test get filtered jobs
describe('getFilteredJobs()', () => {
  it('should correctly return a filtered list of jobs', async function() {
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
  it('should correctly add a job', async function() {
    const newJob = await Job.createJob({
      title: 'SOFTWARE DEVELOPER',
      salary: 5000,
      equity: 0.01,
      company_handle: 'GOOG'
    });
    expect(newJob).toHaveProperty('id');
    expect(newJob.salary).toEqual(5000);
    const jobs = await Job.getFilteredJobs({});
    expect(jobs.length).toEqual(3);
  });
});

//Test get one job
describe('getJob()', () => {
  it('should correctly return a job by id', async function() {
    const job = await Job.getJob(job1.id);
    expect(job.id).toEqual(job1.id);
    expect(job.salary).toEqual(job1.salary);

    //get a job that doesn't exist and check failure
    try {
      await Job.getJob(0);
      throw new Error();
    } catch (e) {
      expect(e.message).toMatch('Cannot find job by that id');
    }
  });
});

//Update a job test
describe('updateJob()', () => {
  it('should correctly update a job', async function() {
    let job = await Job.getJob(job1.id);
    job.title = 'WINDOW WASHER';

    await job.save();

    job = await Job.getJob(job1.id);
    expect(job.title).toEqual('WINDOW WASHER');

    const jobs = await Job.getFilteredJobs({});
    expect(jobs.length).toEqual(2);

    expect(() => {
      job.id = 0;
    }).toThrowError(`Can't change job id!`);
  });
});

//Delete a job test
describe('deleteJob()', () => {
  it('should correctly delete a job', async function() {
    const jobtobeDeleted = await Job.getJob(job1.id);
    const message = await jobtobeDeleted.deleteJob();
    expect(message).toBe('Job Deleted');
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
