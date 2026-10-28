const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/4631_env');
const {
  User,
  UserRole,
  Department,
  Specialization,
  Doctor,
  Availability,
  Slot,
  Appointment,
  AppointmentStatus,
  Notification,
  NotificationType,
  AuditLog
} = require('../models/4631_index');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);

    console.log('[Seed] Clearing existing collections for clean seed...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Specialization.deleteMany({}),
      Doctor.deleteMany({}),
      Availability.deleteMany({}),
      Slot.deleteMany({}),
      Appointment.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Create Admin
    console.log('[Seed] Creating Administrator account...');
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@healthcare.com',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      phone: '+1 555-0100',
      isActive: true
    });

    // 2. Create Departments
    console.log('[Seed] Creating Departments...');
    const departmentsData = [
      { name: 'Cardiology', description: 'Heart and cardiovascular system care' },
      { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
      { name: 'Neurology', description: 'Disorders of the brain, spinal cord, and nervous system' },
      { name: 'Dermatology', description: 'Skin, hair, and nail health and aesthetics' },
      { name: 'Orthopedics', description: 'Musculoskeletal system, bones, joints, and ligaments' },
      { name: 'General Medicine', description: 'Primary healthcare and comprehensive adult medical care' }
    ];
    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach(d => { deptMap[d.name] = d._id; });

    // 3. Create Specializations
    console.log('[Seed] Creating Specializations...');
    const specializationsData = [
      { name: 'Interventional Cardiology', departmentId: deptMap['Cardiology'], description: 'Catheter-based treatment of structural heart diseases' },
      { name: 'Electrophysiology', departmentId: deptMap['Cardiology'], description: 'Heart rhythm and cardiac arrhythmias' },
      { name: 'General Pediatrics', departmentId: deptMap['Pediatrics'], description: 'Childhood vaccinations, growth, and general illness' },
      { name: 'Pediatric Neurology', departmentId: deptMap['Pediatrics'], description: 'Neurological care tailored for pediatric patients' },
      { name: 'Cognitive Neurology', departmentId: deptMap['Neurology'], description: 'Memory disorders, Alzheimer’s, and cognitive decline' },
      { name: 'Clinical Dermatology', departmentId: deptMap['Dermatology'], description: 'Acne, eczema, psoriasis, and skin cancer screening' },
      { name: 'Sports Medicine & Joint Surgery', departmentId: deptMap['Orthopedics'], description: 'Arthroscopic surgery and athletic injury recovery' },
      { name: 'Family & Internal Medicine', departmentId: deptMap['General Medicine'], description: 'Preventative care, chronic illness, and annual checkups' }
    ];
    const specializations = await Specialization.insertMany(specializationsData);
    const specMap = {};
    specializations.forEach(s => { specMap[s.name] = s._id; });

    // 4. Create Doctor Users & Profiles
    console.log('[Seed] Creating Doctor accounts...');
    const doctorsInfo = [
      {
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@healthcare.com', // Primary demo doctor login
        dept: 'Cardiology',
        spec: 'Interventional Cardiology',
        qualification: 'MD, FACC, Harvard Medical School',
        experience: 14,
        fee: 1500,
        bio: 'Senior Cardiologist specializing in minimally invasive catheter interventions and heart health optimization.',
        approved: true
      },
      {
        name: 'Dr. Marcus Vance',
        email: 'marcus.vance@healthcare.com',
        dept: 'Pediatrics',
        spec: 'General Pediatrics',
        qualification: 'MD, FAAP, Johns Hopkins',
        experience: 9,
        fee: 900,
        bio: 'Compassionate pediatrician focused on adolescent health, early milestone assessments, and family wellness.',
        approved: true
      },
      {
        name: 'Dr. Elena Rostova',
        email: 'elena.rostova@healthcare.com',
        dept: 'Neurology',
        spec: 'Cognitive Neurology',
        qualification: 'MD, PhD, Stanford University',
        experience: 16,
        fee: 1800,
        bio: 'Renowned neurologist leading research and clinical care in neurodegenerative disorders and migraine management.',
        approved: true
      },
      {
        name: 'Dr. David Chen',
        email: 'david.chen@healthcare.com',
        dept: 'Dermatology',
        spec: 'Clinical Dermatology',
        qualification: 'MD, American Board of Dermatology',
        experience: 8,
        fee: 1100,
        bio: 'Board-certified dermatologist experienced in cosmetic and medical dermatology and advanced laser treatments.',
        approved: true
      },
      {
        name: 'Dr. Aisha Patel (Pending Approval)',
        email: 'aisha.patel@healthcare.com',
        dept: 'Orthopedics',
        spec: 'Sports Medicine & Joint Surgery',
        qualification: 'MS Ortho, FRCS',
        experience: 5,
        fee: 1200,
        bio: 'Orthopedic surgeon awaiting credential verification by administrator.',
        approved: false // For testing admin approval flow!
      }
    ];

    const createdDoctors = [];

    for (const doc of doctorsInfo) {
      const user = await User.create({
        name: doc.name,
        email: doc.email,
        passwordHash: defaultPasswordHash,
        role: UserRole.DOCTOR,
        phone: '+1 555-02' + Math.floor(10 + Math.random() * 89),
        isActive: true
      });

      const doctorProfile = await Doctor.create({
        userId: user._id,
        departmentId: deptMap[doc.dept],
        specializationId: specMap[doc.spec],
        qualification: doc.qualification,
        experience: doc.experience,
        fee: doc.fee,
        bio: doc.bio,
        approved: doc.approved
      });

      createdDoctors.push({ user, profile: doctorProfile });

      // Create weekly availability for approved doctors (Monday through Friday, 09:00 - 17:00, 30 min slots)
      if (doc.approved) {
        for (let day = 1; day <= 5; day++) {
          await Availability.create({
            doctorId: doctorProfile._id,
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            leaveDates: []
          });
        }
      }
    }

    // 5. Create Patient Account
    console.log('[Seed] Creating Patient account...');
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@healthcare.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.PATIENT,
      phone: '+1 555-0199',
      isActive: true
    });

    // 6. Generate Initial Slots for Dr. Sarah Jenkins for the next 7 days
    console.log('[Seed] Generating initial slots for Dr. Sarah Jenkins...');
    const sarahDoctor = createdDoctors[0].profile;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const timeSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

    const createdSlots = [];
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const slotDate = new Date(today);
      slotDate.setUTCDate(today.getUTCDate() + dayOffset);

      for (const time of timeSlots) {
        const [h, m] = time.split(':').map(Number);
        const endMin = m + 30;
        const endHour = endMin >= 60 ? h + 1 : h;
        const formattedEndMin = endMin >= 60 ? endMin - 60 : endMin;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(formattedEndMin).padStart(2, '0')}`;

        const slot = await Slot.create({
          doctorId: sarahDoctor._id,
          date: slotDate,
          startTime: time,
          endTime,
          isBooked: false
        });
        createdSlots.push(slot);
      }
    }

    // Book one slot for John Doe to demonstrate existing booking & history
    console.log('[Seed] Creating a sample appointment for John Doe...');
    const sampleSlot = createdSlots[0];
    sampleSlot.isBooked = true;
    await sampleSlot.save();

    const sampleAppointment = await Appointment.create({
      patientId: patientUser._id,
      doctorId: sarahDoctor._id,
      slotId: sampleSlot._id,
      status: AppointmentStatus.CONFIRMED,
      reason: 'Routine cardiovascular screening and blood pressure consultation',
      notes: 'Patient requested morning appointment'
    });

    // Create confirmation notification
    await Notification.create({
      userId: patientUser._id,
      appointmentId: sampleAppointment._id,
      type: NotificationType.BOOKING_CONFIRMATION,
      message: `Your appointment with Dr. Sarah Jenkins on ${sampleSlot.date.toISOString().split('T')[0]} at ${sampleSlot.startTime} is confirmed.`
    });

    // Create Audit Log
    await AuditLog.create({
      actor: patientUser._id,
      action: 'BOOK_APPOINTMENT',
      target: `Appointment:${sampleAppointment._id}`,
      details: { doctorId: sarahDoctor._id, slotId: sampleSlot._id }
    });

    console.log('====================================================');
    console.log(' [Seed] Database seeded successfully!');
    console.log(' Default credentials:');
    console.log(' - Admin:   admin@healthcare.com   / Admin@123');
    console.log(' - Doctor:  doctor@healthcare.com  / Password@123');
    console.log(' - Patient: patient@healthcare.com / Password@123');
    console.log('====================================================');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedData();
