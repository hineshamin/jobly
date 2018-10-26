const express = require('express');
const router = new express.Router();
const Job = require('../models/job');
const Application = require('../models/application');
const { classPartialUpdate } = require('../helpers/partialUpdate');
const validateInput = require('../middleware/validation');
const newJobSchema = require('../schema/newJob.json');
const updateJobSchema = require('../schema/updateJob.json');
const {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdminUser
} = require('../middleware/auth');

//Get a filtered list of jobs
router.get('/', ensureLoggedIn, async function(req, res, next) {
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
router.post('/', ensureAdminUser, validateInput(newJobSchema), async function(
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
router.get('/:id', ensureLoggedIn, async function(req, res, next) {
  try {
    const job = await Job.getJob(req.params.id);
    return res.json({ job });
  } catch (error) {
    return next(error);
  }
});

//Update a job
router.patch(
  '/:id',
  ensureAdminUser,
  validateInput(updateJobSchema),
  async function(req, res, next) {
    try {
      let job = await Job.getJob(req.params.id);
      job.updateFromValues(req.body);
      await job.save();
      return res.json({ job });
    } catch (error) {
      return next(error);
    }
  }
);

//Delete a job
router.delete('/:id', ensureAdminUser, async function(req, res, next) {
  try {
    const jobToDelete = await Job.getJob(req.params.id);
    const message = await jobToDelete.deleteJob();
    return res.json({ message });
  } catch (error) {
    return next(error);
  }
});

//Apply for a job
router.post('/:id/apply', ensureLoggedIn, async function(req, res, next) {
  try {
    const username = req.username;
    const job_id = req.params.id;
    const state = req.body.state;
    const application = await Application.createApplication({
      username,
      job_id,
      state
    });
    return res.json({ message: application.state });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
