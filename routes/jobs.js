const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');
const newJobSchema = require('../schema/newJob.json');
const updateJobSchema = require('../schema/updateJob.json');

//Get a filtered list of jobs
router.get('/', async function (req, res, next) {
  try {
    const jobsResults = await Job.getFilteredJobs(req.query);
    const jobs = jobsResults.map(job => ({
      title: job.title,
      company_handle: job.company_handle
    }));
    return res.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

//Create a new job
router.post('/', validateInput(newJobSchema), async function (
  req,
  res,
  next
) {
  try {
    const job = await Job.createJob(req.body);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

//Get a job by id
router.get('/:id', async function (req, res, next) {
  try {
    const job = await Job.getJob(req.params.id);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

//Update a job
router.patch('/:id', validateInput(updateJobSchema), async function (
  req,
  res,
  next
) {
  try {
    const jobToUpdate = await Job.getJob(req.params.id);
    classPartialUpdate(jobToUpdate, req.body);
    const updateJob = await jobToUpdate.updateJob();
    return res.json({ job: updateJob });
  } catch (error) {
    return next(error);
  }
});

//Delete a job
router.delete('/:id', async function (req, res, next) {
  try {
    const jobToDelete = await Job.getJob(req.params.id);
    const message = await jobToDelete.deleteJob();
    return res.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
