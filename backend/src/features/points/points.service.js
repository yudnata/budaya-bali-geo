const pointsModel = require('./points.model');

const createPoint = async (ownerID, input) => {
  return await pointsModel.createPoint(ownerID, input);
};

const getMyPoints = async (ownerID) => {
  const points = await pointsModel.getMyPoints(ownerID);
  return points || [];
};

const getAllPoints = async () => {
  const points = await pointsModel.getAllPoints();
  return points || [];
};

const getPublicPoints = async () => {
  const points = await pointsModel.getPublicPoints();
  return points || [];
};

const getPending = async () => {
  const points = await pointsModel.getPendingPoints();
  return points || [];
};

const updatePoint = async (userID, role, pointID, input) => {
  const point = await pointsModel.getPointByID(pointID);
  if (!point) {
    throw new Error("Titik bangunan tidak ditemukan");
  }

  if (role !== 'admin' && point.owner_id !== userID) {
    throw new Error("Anda tidak memiliki izin untuk mengedit titik ini");
  }

  return await pointsModel.updatePoint(pointID, input);
};

const deletePoint = async (userID, role, pointID) => {
  const point = await pointsModel.getPointByID(pointID);
  if (!point) {
    throw new Error("Titik bangunan tidak ditemukan");
  }

  if (role !== 'admin' && point.owner_id !== userID) {
    throw new Error("Anda tidak memiliki izin untuk menghapus titik ini");
  }

  await pointsModel.deletePoint(pointID);
};

const verifyPoint = async (pointID, status, rejectionNote) => {
  await pointsModel.updatePointStatus(pointID, status, rejectionNote);
};

const getAllCategories = async () => {
  const categories = await pointsModel.getAllCategories();
  return categories || [];
};

const createCategory = async (name, icon) => {
  return await pointsModel.createCategory(name, icon);
};

const updateCategory = async (id, name, icon) => {
  return await pointsModel.updateCategory(id, name, icon);
};

const deleteCategory = async (id) => {
  await pointsModel.deleteCategory(id);
};

const getBlog = async (pointID) => {
  const blog = await pointsModel.getBlogByPointID(pointID);
  if (!blog) {
    throw new Error("Blog tidak ditemukan");
  }
  return blog;
};

const upsertBlog = async (pointID, input) => {
  return await pointsModel.upsertBlog(pointID, input.content);
};

const getBlogDetail = async (pointID) => {
  const point = await pointsModel.getPointByID(pointID);
  if (!point) {
    throw new Error("Titik bangunan tidak ditemukan");
  }

  const blog = await pointsModel.getBlogByPointID(pointID);
  
  return {
    blog: blog || null,
    point: point
  };
};

module.exports = {
  createPoint,
  getMyPoints,
  getAllPoints,
  getPublicPoints,
  getPending,
  updatePoint,
  deletePoint,
  verifyPoint,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBlog,
  upsertBlog,
  getBlogDetail,
};
