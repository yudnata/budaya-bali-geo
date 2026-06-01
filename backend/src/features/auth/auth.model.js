const db = require('../../config/database');

const createUser = async (user) => {
  const query = `
    INSERT INTO users (email, password, full_name)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [user.email, user.password, user.full_name];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const findByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE email = $1;`;
  const { rows } = await db.query(query, [email]);
  return rows[0];
};

const findByID = async (id) => {
  const query = `SELECT * FROM users WHERE id = $1;`;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const ssoLogin = async (user) => {
  const query = `
    INSERT INTO users (email, full_name, sso_provider, sso_id, avatar_url, has_password, is_profile_completed)
    VALUES ($1, $2, $3, $4, $5, false, true)
    ON CONFLICT (email)
    DO UPDATE SET 
      sso_provider = EXCLUDED.sso_provider,
      sso_id = EXCLUDED.sso_id,
      avatar_url = EXCLUDED.avatar_url,
      updated_at = NOW()
    RETURNING *;
  `;
  const values = [user.email, user.full_name, user.sso_provider, user.sso_id, user.avatar_url];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const updateProfile = async (id, req) => {
  const query = `
    UPDATE users 
    SET full_name = $1, phone = $2, avatar_url = $3, is_profile_completed = true, updated_at = NOW()
    WHERE id = $4
    RETURNING *;
  `;
  const values = [req.full_name, req.phone, req.avatar_url, id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const updatePassword = async (id, newPassword) => {
  const query = `
    UPDATE users 
    SET password = $1, has_password = true, updated_at = NOW()
    WHERE id = $2;
  `;
  const values = [newPassword, id];
  await db.query(query, values);
};

const getUsers = async () => {
  const query = `SELECT id, email, full_name, role, avatar_url, created_at FROM users;`;
  const { rows } = await db.query(query);
  return rows;
};

module.exports = {
  createUser,
  findByEmail,
  findByID,
  ssoLogin,
  updateProfile,
  updatePassword,
  getUsers,
};
