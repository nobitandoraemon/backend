const bcrypt = require("bcryptjs");
const User = require('../models/User');

const userController = {
  // Lấy tất cả người dùng (không lấy password)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // Lấy thông tin một người theo username
  getUserByUsername: async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username }).select("-password");
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // Cập nhật thông tin người dùng (dùng form)
  updateUser: async (req, res) => {
    try {
      const { username } = req.params;
      
      // Lấy dữ liệu từ form, chỉ cho phép cập nhật các trường không nhạy cảm
      const { birthday, gender, zodiac, hobbies, location, hasChatted } = req.body;
      const updateData = { birthday, gender, zodiac, hobbies, location, hasChatted };

      const updatedUser = await User.findOneAndUpdate(
        { username },
        updateData,
        { new: true }
      );

      if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // Xóa người dùng
  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.findOneAndDelete({ username: req.params.username });
      if (!deletedUser) return res.status(404).json({ message: "Không tìm thấy người dùng" });
      res.json({ message: "Xóa thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  },

  // Tạo người dùng mới (mã hóa password)
  createUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Kiểm tra username đã tồn tại hay chưa
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: "Username đã tồn tại" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new User({ ...req.body, password: hashedPassword });
      await newUser.save();
      res.json({ message: "Tạo tài khoản thành công" });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server" });
    }
  }
};

module.exports = userController;
