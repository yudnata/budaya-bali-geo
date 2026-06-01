const db = require('../../config/database');

const createPoint = async (ownerID, input) => {
  const query = `
    INSERT INTO map_points (category_id, name, latitude, longitude, address, owner_id, tahun_berdiri, description, cover_image, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    input.category_id,
    input.name,
    input.latitude,
    input.longitude,
    input.address,
    ownerID,
    input.tahun_berdiri,
    input.description,
    input.cover_image,
    input.status,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const getMyPoints = async (ownerID) => {
  const query = `
    SELECT * FROM map_points 
    WHERE owner_id = $1 
    ORDER BY created_at DESC;
  `;
  const { rows } = await db.query(query, [ownerID]);
  return rows;
};

const getAllPoints = async () => {
  const query = `
    SELECT mp.*, u.full_name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
           c.name as category_name, c.icon as category_icon
    FROM map_points mp
    LEFT JOIN users u ON mp.owner_id = u.id
    LEFT JOIN categories c ON mp.category_id = c.id
    ORDER BY mp.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const getPublicPoints = async () => {
  const query = `
    SELECT mp.*, u.full_name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
           c.name as category_name, c.icon as category_icon
    FROM map_points mp
    LEFT JOIN users u ON mp.owner_id = u.id
    LEFT JOIN categories c ON mp.category_id = c.id
    WHERE mp.status = 'approved'
    ORDER BY mp.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const getPendingPoints = async () => {
  const query = `
    SELECT mp.*, u.full_name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
           c.name as category_name, c.icon as category_icon
    FROM map_points mp
    LEFT JOIN users u ON mp.owner_id = u.id
    LEFT JOIN categories c ON mp.category_id = c.id
    WHERE mp.status = 'pending'
    ORDER BY mp.created_at DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};

const getPointByID = async (id) => {
  const query = `
    SELECT mp.*, u.full_name as owner_name, u.email as owner_email, u.avatar_url as owner_avatar,
           c.name as category_name, c.icon as category_icon
    FROM map_points mp
    LEFT JOIN users u ON mp.owner_id = u.id
    LEFT JOIN categories c ON mp.category_id = c.id
    WHERE mp.id = $1;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updatePoint = async (id, input) => {
  const query = `
    UPDATE map_points
    SET category_id = $1, name = $2, latitude = $3, longitude = $4, address = $5,
        tahun_berdiri = $6, description = $7, cover_image = $8, status = $9, updated_at = NOW()
    WHERE id = $10
    RETURNING *;
  `;
  const values = [
    input.category_id,
    input.name,
    input.latitude,
    input.longitude,
    input.address,
    input.tahun_berdiri,
    input.description,
    input.cover_image,
    input.status,
    id,
  ];
  const { rows } = await db.query(query, values);
  return rows[0];
};

const deletePoint = async (id) => {
  const query = `DELETE FROM map_points WHERE id = $1;`;
  await db.query(query, [id]);
};

const updatePointStatus = async (id, status, rejectionNote) => {
  const query = `
    UPDATE map_points 
    SET status = $1, rejection_note = $2, updated_at = NOW()
    WHERE id = $3;
  `;
  await db.query(query, [status, rejectionNote, id]);
};

const getAllCategories = async () => {
  const query = `SELECT * FROM categories ORDER BY id ASC;`;
  const { rows } = await db.query(query);
  return rows;
};

const createCategory = async (name, icon) => {
  const query = `
    INSERT INTO categories (name, icon) 
    VALUES ($1, $2) 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [name, icon]);
  return rows[0];
};

const updateCategory = async (id, name, icon) => {
  const query = `
    UPDATE categories 
    SET name = $1, icon = $2 
    WHERE id = $3 
    RETURNING *;
  `;
  const { rows } = await db.query(query, [name, icon, id]);
  return rows[0];
};

const deleteCategory = async (id) => {
  const query = `DELETE FROM categories WHERE id = $1;`;
  await db.query(query, [id]);
};

const getBlogByPointID = async (pointID) => {
  const query = `SELECT * FROM blogs WHERE map_point_id = $1;`;
  const { rows } = await db.query(query, [pointID]);
  return rows[0];
};

const upsertBlog = async (pointID, content) => {
  const query = `
    INSERT INTO blogs (map_point_id, content)
    VALUES ($1, $2)
    ON CONFLICT (map_point_id)
    DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
    RETURNING *;
  `;
  const { rows } = await db.query(query, [pointID, content]);
  return rows[0];
};

module.exports = {
  createPoint,
  getMyPoints,
  getAllPoints,
  getPublicPoints,
  getPendingPoints,
  getPointByID,
  updatePoint,
  deletePoint,
  updatePointStatus,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBlogByPointID,
  upsertBlog,
};
