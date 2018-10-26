const db = require('../db');
const {
  sqlForPartialUpdate,
  classPartialUpdate
} = require('../helpers/partialUpdate');

class Application {
  constructor({ username, job_id, state, created_at }) {
    this.username = username;
    this.job_id = job_id;
    this.state = state;
    this.created_at = created_at;
  }
  static async getUserApplications(username) {
    const result = await db.query(
      `
      SELECT username, job_id, state, created_at 
      FROM applications
      WHERE username = $1
      `,
      [username]
    );
    return result.rows.map(val => new Application(val));
  }

  static async createApplication({ username, job_id, state }) {
    const result = await db.query(
      `
    INSERT INTO applications (username, job_id, state)
    VALUES ($1,$2,$3)
    RETURNING username, job_id, state, created_at
    `,
      [username, job_id, state]
    );
    if (result.rows.length === 0) {
      throw new Error(`Can't create application`);
    }
    return new Application(result.rows[0]);
  }
}

module.exports = Application;
