const pointsService = require('./points.service');
const pointsModel = require('./points.model');
const uploadService = require('../../utils/cloudinary.util');
const { success, error } = require('../../utils/response.util');

const getIDParam = (req) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    throw new Error('ID tidak valid');
  }
  return id;
};

const create = async (req, res) => {
  try {
    const input = req.body;
    if (!input.name || !input.latitude || !input.longitude) {
      return res.status(400).json(error('Name, Latitude, dan Longitude wajib diisi'));
    }

    const ownerID = req.user?.userID || "00000000-0000-0000-0000-000000000000";
    const point = await pointsService.createPoint(ownerID, input);
    res.status(201).json(success('Titik berhasil disimpan', point));
  } catch (err) {
    res.status(500).json(error('Gagal menyimpan data: ' + err.message));
  }
};

const getMy = async (req, res) => {
  try {
    const userID = req.user.userID;
    const points = await pointsService.getMyPoints(userID);
    res.status(200).json(success('Berhasil mengambil titik milik pengguna', points));
  } catch (err) {
    res.status(500).json(error('Gagal mengambil titik milik pengguna'));
  }
};

const getAll = async (req, res) => {
  try {
    const points = await pointsService.getAllPoints();
    res.status(200).json(success('Berhasil mendapatkan data peta', points));
  } catch (err) {
    res.status(500).json(error('Gagal memuat titik peta: ' + err.message));
  }
};

const getPublic = async (req, res) => {
  try {
    const points = await pointsService.getPublicPoints();
    res.status(200).json(success('Berhasil mendapatkan data peta publik', points));
  } catch (err) {
    console.error("getPublic error:", err);
    res.status(500).json(error('Gagal memuat titik peta publik'));
  }
};

const update = async (req, res) => {
  try {
    const id = getIDParam(req);
    const input = req.body;
    const userID = req.user.userID;
    const role = req.user.role;

    const point = await pointsService.updatePoint(userID, role, id, input);
    res.status(200).json(success('Titik bangunan berhasil diperbarui', point));
  } catch (err) {
    if (err.message === 'ID tidak valid' || err.message.includes('tidak ditemukan')) {
      res.status(400).json(error(err.message));
    } else {
      res.status(500).json(error('Gagal memperbarui data: ' + err.message));
    }
  }
};

const deletePoint = async (req, res) => {
  try {
    const id = getIDParam(req);
    const userID = req.user.userID;
    const role = req.user.role;

    await pointsService.deletePoint(userID, role, id);
    res.status(200).json(success('Titik bangunan berhasil dihapus', null));
  } catch (err) {
    res.status(500).json(error('Gagal menghapus data: ' + err.message));
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await pointsService.getAllCategories();
    res.status(200).json(success('Berhasil mengambil kategori', categories));
  } catch (err) {
    console.error("getCategories error:", err);
    res.status(500).json(error('Gagal mengambil kategori'));
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !icon) {
      return res.status(400).json(error('Nama dan icon wajib diisi'));
    }
    const cat = await pointsService.createCategory(name, icon);
    res.status(201).json(success('Kategori berhasil dibuat', cat));
  } catch (err) {
    res.status(500).json(error('Gagal membuat kategori'));
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = getIDParam(req);
    const { name, icon } = req.body;
    if (!name || !icon) {
      return res.status(400).json(error('Nama dan icon wajib diisi'));
    }
    const cat = await pointsService.updateCategory(id, name, icon);
    res.status(200).json(success('Kategori berhasil diperbarui', cat));
  } catch (err) {
    res.status(500).json(error('Gagal memperbarui kategori'));
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = getIDParam(req);
    await pointsService.deleteCategory(id);
    res.status(200).json(success('Kategori berhasil dihapus', null));
  } catch (err) {
    res.status(500).json(error('Gagal menghapus kategori'));
  }
};

const getBlog = async (req, res) => {
  try {
    const id = getIDParam(req);
    const blog = await pointsService.getBlog(id);
    res.status(200).json(success('Berhasil mengambil data blog', blog));
  } catch (err) {
    res.status(404).json(error('Blog tidak ditemukan'));
  }
};

const upsertBlog = async (req, res) => {
  try {
    const id = getIDParam(req);
    const input = req.body;
    const userID = req.user.userID;
    const role = req.user.role;

    const point = await pointsModel.getPointByID(id);
    if (!point) {
      return res.status(404).json(error('Titik tidak ditemukan'));
    }

    if (role !== 'admin' && point.owner_id !== userID) {
      return res.status(403).json(error('Anda tidak memiliki izin untuk mengulas titik ini'));
    }

    const blog = await pointsService.upsertBlog(id, input);
    res.status(200).json(success('Ulasan berhasil disimpan', blog));
  } catch (err) {
    res.status(500).json(error('Gagal menyimpan ulasan: ' + err.message));
  }
};

const uploadImg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(error('Gambar tidak ditemukan'));
    }

    const url = await uploadService.uploadImage(req.file.buffer, 'points');
    res.status(200).json(success('Gambar berhasil diunggah', { url }));
  } catch (err) {
    res.status(500).json(error('Gagal mengunggah gambar'));
  }
};

const getPending = async (req, res) => {
  try {
    const points = await pointsService.getPending();
    res.status(200).json(success('Data pengajuan berhasil diambil', points));
  } catch (err) {
    res.status(500).json(error('Gagal mengambil data'));
  }
};

const verifyPoint = async (req, res) => {
  try {
    const id = getIDParam(req);
    const { status, rejection_note } = req.body;

    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json(error('Status harus approved atau rejected'));
    }

    await pointsService.verifyPoint(id, status, rejection_note || null);
    res.status(200).json(success('Data berhasil diverifikasi', null));
  } catch (err) {
    res.status(500).json(error('Gagal memverifikasi data'));
  }
};

const getPublicBlog = async (req, res) => {
  try {
    const id = getIDParam(req);
    const detail = await pointsService.getBlogDetail(id);
    res.status(200).json(success('Berhasil mengambil detail ulasan', detail));
  } catch (err) {
    res.status(404).json(error(err.message));
  }
};

module.exports = {
  create,
  getMy,
  getAll,
  getPublic,
  update,
  deletePoint,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBlog,
  upsertBlog,
  uploadImg,
  getPending,
  verifyPoint,
  getPublicBlog,
};
