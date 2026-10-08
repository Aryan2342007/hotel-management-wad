const Staff = require('../models/Staff');

// Helper to generate staff code
const generateStaffCode = async () => {
  const count = await Staff.countDocuments();
  return `EMP-${String(count + 1).padStart(3, '0')}`;
};

// @desc    Get all staff members
// @route   GET /api/staff
exports.getStaff = async (req, res) => {
  try {
    const { role, shift, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (shift) filter.shift = shift;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { staffCode: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const staffList = await Staff.find(filter).sort({ staffCode: 1 });
    res.json({ success: true, count: staffList.length, data: staffList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new staff member
// @route   POST /api/staff
exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, role, shift, salary } = req.body;

    const existingEmail = await Staff.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered for another staff' });
    }

    const staffCode = await generateStaffCode();

    const staff = await Staff.create({
      staffCode,
      name,
      email,
      phone,
      role,
      shift,
      salary,
    });

    res.status(201).json({ success: true, message: 'Staff created successfully', data: staff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
exports.updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    res.json({ success: true, message: 'Staff member updated', data: staff });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }
    res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
