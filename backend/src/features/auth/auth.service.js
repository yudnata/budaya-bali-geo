const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authModel = require('./auth.model');
const config = require('../../config/config');

const generateToken = (user) => {
  return jwt.sign(
    { sub: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '72h' }
  );
};

const register = async (req) => {
  const existingUser = await authModel.findByEmail(req.email);
  if (existingUser) {
    throw new Error('Email sudah terdaftar');
  }

  const hashedPassword = await bcrypt.hash(req.password, 10);
  const user = await authModel.createUser({
    ...req,
    password: hashedPassword,
  });

  delete user.password;
  return user;
};

const login = async (req) => {
  const user = await authModel.findByEmail(req.email);
  if (!user) {
    throw new Error('Email atau password salah');
  }

  if (!user.password || user.password === '') {
    throw new Error('Akun ini menggunakan login SSO. Silakan login menggunakan Google');
  }

  const isValidPassword = await bcrypt.compare(req.password, user.password);
  if (!isValidPassword) {
    throw new Error('Email atau password salah');
  }

  const token = generateToken(user);
  delete user.password;
  
  user.has_password = true;

  return { token, user };
};

const ssoLogin = async (req) => {
  const user = await authModel.ssoLogin(req);
  const token = generateToken(user);
  delete user.password;
  return { token, user };
};

const updateProfile = async (id, req) => {
  const user = await authModel.updateProfile(id, req);
  user.has_password = !!(user.password && user.password !== '');
  delete user.password;
  return user;
};

const getMe = async (id) => {
  const user = await authModel.findByID(id);
  if (!user) {
    throw new Error('User tidak ditemukan');
  }
  user.has_password = !!(user.password && user.password !== '');
  delete user.password;
  return user;
};

const updatePassword = async (id, req) => {
  const user = await authModel.findByID(id);
  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  if (user.password && user.password !== '') {
    if (!req.old_password) {
      throw new Error('Password lama harus diisi');
    }
    const isValid = await bcrypt.compare(req.old_password, user.password);
    if (!isValid) {
      throw new Error('Password lama tidak sesuai');
    }
  }

  const hashedPassword = await bcrypt.hash(req.new_password, 10);
  await authModel.updatePassword(id, hashedPassword);
};

const getUsers = async () => {
  return await authModel.getUsers();
};

module.exports = {
  register,
  login,
  ssoLogin,
  updateProfile,
  getMe,
  updatePassword,
  getUsers,
};
