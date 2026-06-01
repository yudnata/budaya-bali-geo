const authService = require('./auth.service');
const { success, error } = require('../../utils/response.util');
const uploadService = require('../../utils/cloudinary.util');
const config = require('../../config/config');

const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(success('Berhasil mendaftar', user));
  } catch (err) {
    res.status(409).json(error(err.message));
  }
};

const login = async (req, res) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.status(200).json(success('Berhasil login!', { token, user }));
  } catch (err) {
    res.status(401).json(error(err.message));
  }
};

const ssoLogin = async (req, res) => {
  try {
    const { token, user } = await authService.ssoLogin(req.body);
    res.status(200).json(success('Berhasil login otomatis via SSO', { token, user }));
  } catch (err) {
    res.status(401).json(error('Gagal otentikasi pihak ketiga'));
  }
};

const updateProfile = async (req, res) => {
  try {
    const userID = req.user.userID;
    const user = await authService.updateProfile(userID, req.body);
    res.status(200).json(success('Profil berhasil dilengkapi!', user));
  } catch (err) {
    res.status(400).json(error(err.message));
  }
};

const getMe = async (req, res) => {
  try {
    const userID = req.user.userID;
    const user = await authService.getMe(userID);
    res.status(200).json(success('Data profil berhasil diambil', user));
  } catch (err) {
    res.status(404).json(error('User tidak ditemukan'));
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await authService.getUsers();
    res.status(200).json(success('Data pengguna berhasil diambil', users));
  } catch (err) {
    res.status(500).json(error('Gagal mengambil data pengguna'));
  }
};

const updatePassword = async (req, res) => {
  try {
    const userID = req.user.userID;
    await authService.updatePassword(userID, req.body);
    res.status(200).json(success('Password berhasil diperbarui', null));
  } catch (err) {
    res.status(400).json(error(err.message));
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(error('File tidak ditemukan'));
    }

    const url = await uploadService.uploadImage(req.file.buffer, 'avatars');
    res.status(200).json(success('Berhasil mengunggah avatar', { url }));
  } catch (err) {
    res.status(500).json(error('Gagal mengunggah gambar'));
  }
};

const getConfig = (req, res) => {
  res.status(200).json(success('Config fetched', {
    default_avatar_url: config.defaultAvatarUrl
  }));
};

module.exports = {
  register,
  login,
  ssoLogin,
  updateProfile,
  getMe,
  getUsers,
  updatePassword,
  uploadAvatar,
  getConfig,
};
