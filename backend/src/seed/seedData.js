if (process.platform === 'win32' && process.env.NODE_ENV !== 'production') {
  try {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (err) {}
}
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const Staff = require('../models/Staff');

dotenv.config({ path: __dirname + '/../../.env' });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel_management_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections...');
    await Room.deleteMany({});
    await Guest.deleteMany({});
    await Reservation.deleteMany({});
    await Payment.deleteMany({});
    await Staff.deleteMany({});

    console.log('1. Seeding Rooms...');
    const roomsData = [
      {
        roomNumber: '101',
        roomType: 'Single',
        pricePerNight: 1800,
        floor: 1,
        capacity: 1,
        amenities: ['Wi-Fi', 'AC', 'TV', 'Desk'],
        status: 'Available',
        description: 'Cozy single room ideal for solo business travelers.',
      },
      {
        roomNumber: '102',
        roomType: 'Single',
        pricePerNight: 1800,
        floor: 1,
        capacity: 1,
        amenities: ['Wi-Fi', 'AC', 'TV'],
        status: 'Available',
        description: 'Compact standard single room overlooking the garden.',
      },
      {
        roomNumber: '103',
        roomType: 'Double',
        pricePerNight: 2800,
        floor: 1,
        capacity: 2,
        amenities: ['Wi-Fi', 'AC', 'Smart TV', 'Balcony', 'Mini Fridge'],
        status: 'Occupied',
        description: 'Spacious double bed room with private balcony.',
      },
      {
        roomNumber: '201',
        roomType: 'Double',
        pricePerNight: 3000,
        floor: 2,
        capacity: 2,
        amenities: ['Wi-Fi', 'AC', 'Smart TV', 'Coffee Maker'],
        status: 'Cleaning',
        description: 'Standard double room on second floor.',
      },
      {
        roomNumber: '202',
        roomType: 'Deluxe',
        pricePerNight: 4500,
        floor: 2,
        capacity: 3,
        amenities: ['High-speed Wi-Fi', 'AC', '55" OLED TV', 'Mini Bar', 'Bathtub'],
        status: 'Occupied',
        description: 'Deluxe room with luxurious king size bed and bathtub.',
      },
      {
        roomNumber: '203',
        roomType: 'Deluxe',
        pricePerNight: 4500,
        floor: 2,
        capacity: 3,
        amenities: ['High-speed Wi-Fi', 'AC', '55" OLED TV', 'City View', 'Workstation'],
        status: 'Available',
        description: 'Deluxe room featuring floor-to-ceiling windows.',
      },
      {
        roomNumber: '301',
        roomType: 'Suite',
        pricePerNight: 7500,
        floor: 3,
        capacity: 4,
        amenities: ['High-speed Wi-Fi', 'Living Room Area', 'Jacuzzi', '2 OLED TVs', 'Mini Bar', 'Dining Table'],
        status: 'Available',
        description: 'Executive suite with master bedroom and private living hall.',
      },
      {
        roomNumber: '302',
        roomType: 'Suite',
        pricePerNight: 7500,
        floor: 3,
        capacity: 4,
        amenities: ['High-speed Wi-Fi', 'Living Room Area', 'Jacuzzi', 'Panoramic View'],
        status: 'Maintenance',
        description: 'Suite undergoing air-conditioning scheduled maintenance.',
      },
      {
        roomNumber: '401',
        roomType: 'Penthouse',
        pricePerNight: 15000,
        floor: 4,
        capacity: 5,
        amenities: ['Private Terrace', 'Jacuzzi', 'Private Butler Service', 'Chef Kitchen', 'Panoramic Sea View'],
        status: 'Available',
        description: 'Ultra-luxury top-floor penthouse with private terrace and skyline view.',
      },
      {
        roomNumber: '402',
        roomType: 'Penthouse',
        pricePerNight: 15000,
        floor: 4,
        capacity: 5,
        amenities: ['Private Terrace', 'Jacuzzi', 'Cinema Projector', 'Private Bar'],
        status: 'Available',
        description: 'Royal penthouse suite with sunset terrace.',
      },
    ];

    const createdRooms = await Room.insertMany(roomsData);
    console.log(`✓ Seeded ${createdRooms.length} rooms`);

    console.log('2. Seeding Guests...');
    const guestsData = [
      {
        firstName: 'Aryan',
        lastName: 'Patel',
        email: 'aryan.patel@example.com',
        phone: '+91 9876543210',
        address: { street: '12 MG Road', city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
        idProof: { type: 'Aadhar Card', idNumber: '9845-1234-5678' },
        specialRequests: 'High floor preferred, extra pillows.',
      },
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 9822334455',
        address: { street: '45 Park Street', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        idProof: { type: 'Passport', idNumber: 'N8765432' },
        specialRequests: 'Late check-out request.',
      },
      {
        firstName: 'Rahul',
        lastName: 'Verma',
        email: 'rahul.verma@example.com',
        phone: '+91 9711223344',
        address: { street: '88 Brigade Road', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
        idProof: { type: 'Driving License', idNumber: 'DL-04-2021-9988' },
        specialRequests: 'Airport transfer required.',
      },
      {
        firstName: 'Ananya',
        lastName: 'Deshmukh',
        email: 'ananya.d@example.com',
        phone: '+91 9544332211',
        address: { street: '21 FC Road', city: 'Pune', state: 'Maharashtra', country: 'India' },
        idProof: { type: 'Aadhar Card', idNumber: '7654-3210-9876' },
        specialRequests: 'Quiet room away from elevators.',
      },
      {
        firstName: 'Vikram',
        lastName: 'Singhania',
        email: 'vikram.singh@example.com',
        phone: '+91 9900112233',
        address: { street: '10 Civil Lines', city: 'Jaipur', state: 'Rajasthan', country: 'India' },
        idProof: { type: 'Passport', idNumber: 'Z1234567' },
        specialRequests: 'Vegetarian breakfast options.',
      },
    ];

    const createdGuests = await Guest.insertMany(guestsData);
    console.log(`✓ Seeded ${createdGuests.length} guests`);

    console.log('3. Seeding Staff Members...');
    const staffData = [
      {
        staffCode: 'EMP-001',
        name: 'Rajesh Mehta',
        email: 'rajesh.mehta@grandstay.com',
        phone: '+91 9898001122',
        role: 'Manager',
        shift: 'General (9 AM - 6 PM)',
        salary: 65000,
        status: 'Active',
      },
      {
        staffCode: 'EMP-002',
        name: 'Neha Kapoor',
        email: 'neha.kapoor@grandstay.com',
        phone: '+91 9877112233',
        role: 'Receptionist',
        shift: 'Morning (6 AM - 2 PM)',
        salary: 32000,
        status: 'Active',
      },
      {
        staffCode: 'EMP-003',
        name: 'Suresh Kumar',
        email: 'suresh.kumar@grandstay.com',
        phone: '+91 9811445566',
        role: 'Receptionist',
        shift: 'Evening (2 PM - 10 PM)',
        salary: 32000,
        status: 'Active',
      },
      {
        staffCode: 'EMP-004',
        name: 'Sunita Bai',
        email: 'sunita.bai@grandstay.com',
        phone: '+91 9722334455',
        role: 'Housekeeping',
        shift: 'Morning (6 AM - 2 PM)',
        salary: 22000,
        status: 'Active',
      },
      {
        staffCode: 'EMP-005',
        name: 'Chef Antonio Rossi',
        email: 'antonio.rossi@grandstay.com',
        phone: '+91 9988776655',
        role: 'Chef',
        shift: 'Morning (6 AM - 2 PM)',
        salary: 55000,
        status: 'Active',
      },
      {
        staffCode: 'EMP-006',
        name: 'Vikram Gurung',
        email: 'vikram.gurung@grandstay.com',
        phone: '+91 9655443322',
        role: 'Security',
        shift: 'Night (10 PM - 6 AM)',
        salary: 25000,
        status: 'Active',
      },
    ];

    const createdStaff = await Staff.insertMany(staffData);
    console.log(`✓ Seeded ${createdStaff.length} staff members`);

    console.log('4. Seeding Reservations & Linked Payments...');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Reservation 1: Active CheckedIn Guest (Aryan Patel in Room 103)
    const res1CheckIn = new Date(today);
    res1CheckIn.setDate(today.getDate() - 1);
    const res1CheckOut = new Date(today);
    res1CheckOut.setDate(today.getDate() + 2);
    const room103 = createdRooms.find((r) => r.roomNumber === '103');

    const res1 = await Reservation.create({
      bookingNumber: 'RES-2026-101',
      guest: createdGuests[0]._id,
      room: room103._id,
      checkInDate: res1CheckIn,
      checkOutDate: res1CheckOut,
      numberOfGuests: 2,
      totalNights: 3,
      totalAmount: 3 * room103.pricePerNight,
      status: 'CheckedIn',
      actualCheckInTime: res1CheckIn,
      specialRequests: 'Warm welcome drink requested.',
    });

    // Reservation 2: Active CheckedIn Guest (Priya Sharma in Room 202)
    const res2CheckIn = new Date(today);
    const res2CheckOut = new Date(today);
    res2CheckOut.setDate(today.getDate() + 3);
    const room202 = createdRooms.find((r) => r.roomNumber === '202');

    const res2 = await Reservation.create({
      bookingNumber: 'RES-2026-102',
      guest: createdGuests[1]._id,
      room: room202._id,
      checkInDate: res2CheckIn,
      checkOutDate: res2CheckOut,
      numberOfGuests: 2,
      totalNights: 3,
      totalAmount: 3 * room202.pricePerNight,
      status: 'CheckedIn',
      actualCheckInTime: new Date(),
      specialRequests: 'Honeymoon arrangement.',
    });

    // Reservation 3: Upcoming Confirmed (Rahul Verma in Room 301)
    const res3CheckIn = new Date(today);
    res3CheckIn.setDate(today.getDate() + 1);
    const res3CheckOut = new Date(today);
    res3CheckOut.setDate(today.getDate() + 4);
    const room301 = createdRooms.find((r) => r.roomNumber === '301');

    await Reservation.create({
      bookingNumber: 'RES-2026-103',
      guest: createdGuests[2]._id,
      room: room301._id,
      checkInDate: res3CheckIn,
      checkOutDate: res3CheckOut,
      numberOfGuests: 3,
      totalNights: 3,
      totalAmount: 3 * room301.pricePerNight,
      status: 'Confirmed',
      specialRequests: 'Conference room guide requested.',
    });

    // Reservation 4: Past Completed Stay (Ananya Deshmukh in Room 201)
    const res4CheckIn = new Date(today);
    res4CheckIn.setDate(today.getDate() - 5);
    const res4CheckOut = new Date(today);
    res4CheckOut.setDate(today.getDate() - 2);
    const room201 = createdRooms.find((r) => r.roomNumber === '201');

    const res4 = await Reservation.create({
      bookingNumber: 'RES-2026-098',
      guest: createdGuests[3]._id,
      room: room201._id,
      checkInDate: res4CheckIn,
      checkOutDate: res4CheckOut,
      numberOfGuests: 2,
      totalNights: 3,
      totalAmount: 3 * room201.pricePerNight,
      status: 'CheckedOut',
      actualCheckInTime: res4CheckIn,
      actualCheckOutTime: res4CheckOut,
    });

    // Payment for completed stay res4
    const res4RoomCharge = res4.totalAmount;
    const res4Tax = Math.round(res4RoomCharge * 0.12);
    const res4Service = 500;
    const res4Total = res4RoomCharge + res4Tax + res4Service;

    await Payment.create({
      invoiceNumber: 'INV-2026-801',
      reservation: res4._id,
      guest: createdGuests[3]._id,
      roomCharges: res4RoomCharge,
      taxAmount: res4Tax,
      serviceCharges: res4Service,
      discountAmount: 0,
      totalAmount: res4Total,
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      paidAt: res4CheckOut,
      remarks: 'Settled in full at front desk upon departure.',
    });

    // Reservation 5: Past Completed Stay (Vikram Singhania in Penthouse 401)
    const res5CheckIn = new Date(today);
    res5CheckIn.setDate(today.getDate() - 8);
    const res5CheckOut = new Date(today);
    res5CheckOut.setDate(today.getDate() - 4);
    const room401 = createdRooms.find((r) => r.roomNumber === '401');

    const res5 = await Reservation.create({
      bookingNumber: 'RES-2026-095',
      guest: createdGuests[4]._id,
      room: room401._id,
      checkInDate: res5CheckIn,
      checkOutDate: res5CheckOut,
      numberOfGuests: 4,
      totalNights: 4,
      totalAmount: 4 * room401.pricePerNight,
      status: 'CheckedOut',
      actualCheckInTime: res5CheckIn,
      actualCheckOutTime: res5CheckOut,
    });

    // Payment for penthouse stay res5
    const res5RoomCharge = res5.totalAmount;
    const res5Tax = Math.round(res5RoomCharge * 0.18); // 18% luxury GST
    const res5Service = 2000;
    const res5Total = res5RoomCharge + res5Tax + res5Service;

    await Payment.create({
      invoiceNumber: 'INV-2026-802',
      reservation: res5._id,
      guest: createdGuests[4]._id,
      roomCharges: res5RoomCharge,
      taxAmount: res5Tax,
      serviceCharges: res5Service,
      discountAmount: 1000,
      totalAmount: res5Total - 1000,
      paymentMethod: 'NetBanking',
      paymentStatus: 'Paid',
      paidAt: res5CheckOut,
      remarks: 'VIP corporate billing.',
    });

    console.log('✓ Seeded reservations and payments successfully');

    console.log('=============================================');
    console.log('🎉 MongoDB Hotel Management Database seeded successfully!');
    console.log(`Connected to: ${mongoUri}`);
    console.log('=============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
