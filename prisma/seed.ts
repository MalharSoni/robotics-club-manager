import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'
import 'dotenv/config'
import { seedBootcampMilestones } from './seed-bootcamp-milestones'

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter
const adapter = new PrismaPg(pool)

// Initialize Prisma Client with adapter
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a sample user (coach)
  const passwordHash = await hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'coach@robotics.com' },
    update: {},
    create: {
      email: 'coach@robotics.com',
      name: 'John Coach',
      passwordHash,
      role: 'COACH',
      emailVerified: new Date(),
    },
  })

  // Create coach profile
  const coachProfile = await prisma.coachProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      organization: 'Riverside Robotics Academy',
      phone: '555-0123',
      bio: 'Experienced robotics coach with 10+ years in VEX competitions',
    },
  })

  // Create a season
  const season = await prisma.season.upsert({
    where: { id: 'season-1' },
    update: {},
    create: {
      id: 'season-1',
      name: '2025-2026 High Stakes',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-04-30'),
      current: true,
    },
  })

  // Create a team
  const team = await prisma.team.upsert({
    where: { id: 'team-1' },
    update: {},
    create: {
      id: 'team-1',
      name: 'Team Alpha',
      teamNumber: '1234A',
      description: 'Our flagship competition team',
      seasonId: season.id,
      createdById: coachProfile.id,
      active: true,
    },
  })

  // Link coach to team
  await prisma.teamCoach.upsert({
    where: { id: 'tc-1' },
    update: {},
    create: {
      id: 'tc-1',
      teamId: team.id,
      coachId: coachProfile.id,
      role: 'HEAD_COACH',
    },
  })

  // Create comprehensive skills
  const skills = [
    // Mechanical Skills
    { name: 'Hand Tools', category: 'MECHANICAL', level: 'BEGINNER', color: '#f59e0b', description: 'Basic hand tool usage and safety' },
    { name: 'Power Tools', category: 'MECHANICAL', level: 'INTERMEDIATE', color: '#d97706', description: 'Operating drills, saws, and power equipment' },
    { name: 'Metal Fabrication', category: 'MECHANICAL', level: 'ADVANCED', color: '#b45309', description: 'Cutting, bending, and shaping metal components' },
    { name: 'Assembly Techniques', category: 'MECHANICAL', level: 'BEGINNER', color: '#ea580c', description: 'Building and assembling mechanisms' },
    { name: 'Gear Systems', category: 'MECHANICAL', level: 'INTERMEDIATE', color: '#dc2626', description: 'Understanding and implementing gear ratios' },
    { name: 'Drivetrain Design', category: 'MECHANICAL', level: 'ADVANCED', color: '#991b1b', description: 'Designing efficient robot drivetrains' },
    { name: 'Pneumatics', category: 'MECHANICAL', level: 'EXPERT', color: '#7c2d12', description: 'Pneumatic system design and implementation' },

    // Programming Skills
    { name: 'Python Basics', category: 'PROGRAMMING', level: 'BEGINNER', color: '#059669', description: 'Fundamental Python programming' },
    { name: 'C++ Programming', category: 'PROGRAMMING', level: 'INTERMEDIATE', color: '#10b981', description: 'VEX C++ programming for robots' },
    { name: 'Autonomous Programming', category: 'PROGRAMMING', level: 'ADVANCED', color: '#047857', description: 'Programming autonomous routines' },
    { name: 'Sensor Integration', category: 'PROGRAMMING', level: 'INTERMEDIATE', color: '#065f46', description: 'Working with sensors and feedback loops' },
    { name: 'PID Control', category: 'PROGRAMMING', level: 'ADVANCED', color: '#064e3b', description: 'Implementing PID controllers' },
    { name: 'Computer Vision', category: 'PROGRAMMING', level: 'EXPERT', color: '#022c22', description: 'Vision sensor programming and object detection' },
    { name: 'Debug & Testing', category: 'PROGRAMMING', level: 'INTERMEDIATE', color: '#14b8a6', description: 'Debugging and testing code' },

    // CAD/Design Skills
    { name: 'Basic CAD', category: 'CAD_DESIGN', level: 'BEGINNER', color: '#3b82f6', description: 'Introduction to CAD software' },
    { name: 'Advanced CAD', category: 'CAD_DESIGN', level: 'ADVANCED', color: '#2563eb', description: 'Complex 3D modeling and assemblies' },
    { name: '3D Modeling', category: 'CAD_DESIGN', level: 'INTERMEDIATE', color: '#1d4ed8', description: 'Creating detailed 3D models' },
    { name: 'Technical Drawing', category: 'CAD_DESIGN', level: 'INTERMEDIATE', color: '#1e40af', description: 'Creating technical drawings and blueprints' },
    { name: 'CAD Simulation', category: 'CAD_DESIGN', level: 'ADVANCED', color: '#1e3a8a', description: 'Simulating mechanisms and stress testing' },
    { name: 'Prototyping', category: 'CAD_DESIGN', level: 'INTERMEDIATE', color: '#172554', description: 'Rapid prototyping techniques' },

    // Electrical Skills
    { name: 'Wiring Basics', category: 'ELECTRICAL', level: 'BEGINNER', color: '#eab308', description: 'Basic electrical wiring and safety' },
    { name: 'Circuit Design', category: 'ELECTRICAL', level: 'INTERMEDIATE', color: '#ca8a04', description: 'Designing electrical circuits' },
    { name: 'Troubleshooting', category: 'ELECTRICAL', level: 'INTERMEDIATE', color: '#a16207', description: 'Diagnosing and fixing electrical issues' },
    { name: 'Motor Control', category: 'ELECTRICAL', level: 'ADVANCED', color: '#854d0e', description: 'Motor selection and control systems' },

    // Soft Skills
    { name: 'Teamwork', category: 'COMMUNICATION', level: 'BEGINNER', color: '#ec4899', description: 'Collaborating effectively with team members' },
    { name: 'Leadership', category: 'LEADERSHIP', level: 'INTERMEDIATE', color: '#db2777', description: 'Leading team activities and projects' },
    { name: 'Presentation Skills', category: 'COMMUNICATION', level: 'INTERMEDIATE', color: '#be185d', description: 'Presenting ideas and projects' },
    { name: 'Technical Writing', category: 'COMMUNICATION', level: 'ADVANCED', color: '#9f1239', description: 'Writing technical documentation' },
    { name: 'Project Management', category: 'PROJECT_MANAGEMENT', level: 'ADVANCED', color: '#881337', description: 'Managing projects and timelines' },
    { name: 'Time Management', category: 'PROJECT_MANAGEMENT', level: 'INTERMEDIATE', color: '#4c0519', description: 'Prioritizing and managing time effectively' },

    // Problem Solving
    { name: 'Critical Thinking', category: 'PROBLEM_SOLVING', level: 'INTERMEDIATE', color: '#8b5cf6', description: 'Analyzing and solving complex problems' },
    { name: 'Strategy Development', category: 'PROBLEM_SOLVING', level: 'ADVANCED', color: '#7c3aed', description: 'Developing competition strategies' },
    { name: 'Innovation', category: 'PROBLEM_SOLVING', level: 'ADVANCED', color: '#6d28d9', description: 'Creating innovative solutions' },
    { name: 'Data Analysis', category: 'PROBLEM_SOLVING', level: 'INTERMEDIATE', color: '#5b21b6', description: 'Analyzing match data and metrics' },
  ]

  const createdSkills: any[] = []
  for (const skill of skills) {
    const created = await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    })
    createdSkills.push(created)
  }

  console.log(`✅ Created ${createdSkills.length} skills`)

  // Create realistic students (15 students with diverse backgrounds)
  const students = [
    // Senior students (Grade 12, 2026)
    {
      id: 'student-1',
      firstName: 'Marcus',
      lastName: 'Chen',
      email: 'marcus.chen@students.riverside.edu',
      phone: '555-0101',
      grade: 12,
      gradYear: 2026,
      parentName: 'Jennifer Chen',
      parentEmail: 'jennifer.chen@email.com',
      parentPhone: '555-0102',
      bio: 'Team captain with 4 years of VEX experience. Specializes in pneumatic systems and competition strategy. Led team to state championships last year.',
      primaryRole: 'CAPTAIN',
    },
    {
      id: 'student-2',
      firstName: 'Aisha',
      lastName: 'Patel',
      email: 'aisha.patel@students.riverside.edu',
      phone: '555-0103',
      grade: 12,
      gradYear: 2026,
      parentName: 'Raj Patel',
      parentEmail: 'raj.patel@email.com',
      parentPhone: '555-0104',
      bio: 'Lead programmer with expertise in autonomous routines and PID control. Maintains the engineering notebook and documentation.',
      primaryRole: 'PROGRAMMER',
    },
    {
      id: 'student-3',
      firstName: 'Ethan',
      lastName: 'Rodriguez',
      email: 'ethan.rodriguez@students.riverside.edu',
      phone: '555-0105',
      grade: 12,
      gradYear: 2026,
      parentName: 'Maria Rodriguez',
      parentEmail: 'maria.rodriguez@email.com',
      parentPhone: '555-0106',
      bio: 'CAD specialist focusing on drivetrain and mechanism design. Proficient in Fusion 360 and simulation tools.',
      primaryRole: 'DESIGNER',
    },

    // Junior students (Grade 11, 2027)
    {
      id: 'student-4',
      firstName: 'Zoe',
      lastName: 'Thompson',
      email: 'zoe.thompson@students.riverside.edu',
      phone: '555-0107',
      grade: 11,
      gradYear: 2027,
      parentName: 'David Thompson',
      parentEmail: 'david.thompson@email.com',
      parentPhone: '555-0108',
      bio: 'Primary robot driver with excellent reflexes and game sense. Also skilled at mechanical assembly and testing.',
      primaryRole: 'DRIVER',
    },
    {
      id: 'student-5',
      firstName: 'Jamal',
      lastName: 'Washington',
      email: 'jamal.washington@students.riverside.edu',
      phone: '555-0109',
      grade: 11,
      gradYear: 2027,
      parentName: 'Keisha Washington',
      parentEmail: 'keisha.washington@email.com',
      parentPhone: '555-0110',
      bio: 'Lead builder specializing in metal fabrication and power tools. Innovative problem solver for mechanical challenges.',
      primaryRole: 'BUILDER',
    },
    {
      id: 'student-6',
      firstName: 'Sophia',
      lastName: 'Nguyen',
      email: 'sophia.nguyen@students.riverside.edu',
      phone: '555-0111',
      grade: 11,
      gradYear: 2027,
      parentName: 'Linh Nguyen',
      parentEmail: 'linh.nguyen@email.com',
      parentPhone: '555-0112',
      bio: 'Engineering notebook keeper with strong technical writing skills. Also assists with CAD design and prototyping.',
      primaryRole: 'NOTEBOOK',
    },
    {
      id: 'student-7',
      firstName: 'Connor',
      lastName: 'O\'Brien',
      email: 'connor.obrien@students.riverside.edu',
      phone: '555-0113',
      grade: 11,
      gradYear: 2027,
      parentName: 'Patrick O\'Brien',
      parentEmail: 'patrick.obrien@email.com',
      parentPhone: '555-0114',
      bio: 'Competition scout and data analyst. Tracks opponent strategies and provides match insights using statistical analysis.',
      primaryRole: 'SCOUT',
    },

    // Sophomore students (Grade 10, 2028)
    {
      id: 'student-8',
      firstName: 'Maya',
      lastName: 'Johnson',
      email: 'maya.johnson@students.riverside.edu',
      phone: '555-0115',
      grade: 10,
      gradYear: 2028,
      parentName: 'Angela Johnson',
      parentEmail: 'angela.johnson@email.com',
      parentPhone: '555-0116',
      bio: 'Aspiring programmer learning C++ and sensor integration. Eager to contribute to autonomous development.',
      primaryRole: 'PROGRAMMER',
    },
    {
      id: 'student-9',
      firstName: 'Lucas',
      lastName: 'Anderson',
      email: 'lucas.anderson@students.riverside.edu',
      phone: '555-0117',
      grade: 10,
      gradYear: 2028,
      parentName: 'Karen Anderson',
      parentEmail: 'karen.anderson@email.com',
      parentPhone: '555-0118',
      bio: 'Builder focusing on gear systems and mechanical efficiency. Learning CAD to better understand design-to-build process.',
      primaryRole: 'BUILDER',
    },
    {
      id: 'student-10',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@students.riverside.edu',
      phone: '555-0119',
      grade: 10,
      gradYear: 2028,
      parentName: 'Anita Sharma',
      parentEmail: 'anita.sharma@email.com',
      parentPhone: '555-0120',
      bio: 'Designer with an eye for aesthetics and functionality. Learning advanced CAD techniques and simulation.',
      primaryRole: 'DESIGNER',
    },
    {
      id: 'student-11',
      firstName: 'Tyler',
      lastName: 'Brown',
      email: 'tyler.brown@students.riverside.edu',
      phone: '555-0121',
      grade: 10,
      gradYear: 2028,
      parentName: 'Michael Brown',
      parentEmail: 'michael.brown@email.com',
      parentPhone: '555-0122',
      bio: 'Backup driver and general team member. Strong work ethic and team player, learning multiple roles.',
      primaryRole: 'MEMBER',
    },

    // Freshman students (Grade 9, 2029)
    {
      id: 'student-12',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@students.riverside.edu',
      phone: '555-0123',
      grade: 9,
      gradYear: 2029,
      parentName: 'Sarah Davis',
      parentEmail: 'sarah.davis@email.com',
      parentPhone: '555-0124',
      bio: 'New to robotics but quick learner. Interested in programming and electronics. Completed safety training.',
      primaryRole: 'MEMBER',
    },
    {
      id: 'student-13',
      firstName: 'Ryan',
      lastName: 'Garcia',
      email: 'ryan.garcia@students.riverside.edu',
      phone: '555-0125',
      grade: 9,
      gradYear: 2029,
      parentName: 'Carlos Garcia',
      parentEmail: 'carlos.garcia@email.com',
      parentPhone: '555-0126',
      bio: 'Enthusiastic builder learning hand tools and assembly techniques. Shows great potential in mechanical work.',
      primaryRole: 'BUILDER',
    },
    {
      id: 'student-14',
      firstName: 'Chloe',
      lastName: 'Lee',
      email: 'chloe.lee@students.riverside.edu',
      phone: '555-0127',
      grade: 9,
      gradYear: 2029,
      parentName: 'Michelle Lee',
      parentEmail: 'michelle.lee@email.com',
      parentPhone: '555-0128',
      bio: 'Artistic student interested in design and documentation. Learning basic CAD and helping with notebook.',
      primaryRole: 'DESIGNER',
    },
    {
      id: 'student-15',
      firstName: 'Noah',
      lastName: 'Taylor',
      email: 'noah.taylor@students.riverside.edu',
      phone: '555-0129',
      grade: 9,
      gradYear: 2029,
      parentName: 'Robert Taylor',
      parentEmail: 'robert.taylor@email.com',
      parentPhone: '555-0130',
      bio: 'Tech-savvy freshman with Python experience. Eager to learn robotics programming and computer vision.',
      primaryRole: 'PROGRAMMER',
    },
  ]

  const createdStudents: any[] = []
  for (const studentData of students) {
    const student = await prisma.student.upsert({
      where: { id: studentData.id },
      update: {},
      create: {
        id: studentData.id,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        phone: studentData.phone,
        grade: studentData.grade,
        gradYear: studentData.gradYear,
        parentName: studentData.parentName,
        parentEmail: studentData.parentEmail,
        parentPhone: studentData.parentPhone,
        bio: studentData.bio,
        active: true,
      },
    })
    createdStudents.push(student)

    // Add students to team with their primary role
    await prisma.teamMember.upsert({
      where: { id: `tm-${studentData.id}` },
      update: {},
      create: {
        id: `tm-${studentData.id}`,
        teamId: team.id,
        studentId: student.id,
        primaryRole: (studentData as any).primaryRole,
        active: true,
      },
    })
  }

  console.log(`✅ Created ${createdStudents.length} students with diverse backgrounds`)

  // Assign skills to students with varied proficiency levels
  const skillAssignments = [
    // Marcus Chen (Senior Captain) - Well-rounded with advanced skills
    { studentId: 'student-1', skillNames: ['Teamwork', 'Leadership', 'Project Management', 'Strategy Development', 'Pneumatics', 'Metal Fabrication', 'Power Tools', 'Hand Tools', 'Assembly Techniques', 'Critical Thinking', 'Presentation Skills'], proficiencies: ['EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED', 'EXPERT', 'ADVANCED', 'ADVANCED', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED'] },

    // Aisha Patel (Senior Programmer) - Programming expert
    { studentId: 'student-2', skillNames: ['C++ Programming', 'Autonomous Programming', 'PID Control', 'Computer Vision', 'Sensor Integration', 'Debug & Testing', 'Python Basics', 'Technical Writing', 'Data Analysis', 'Problem Solving', 'Teamwork'], proficiencies: ['EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'ADVANCED'] },

    // Ethan Rodriguez (Senior Designer) - CAD specialist
    { studentId: 'student-3', skillNames: ['Advanced CAD', 'CAD Simulation', '3D Modeling', 'Technical Drawing', 'Prototyping', 'Basic CAD', 'Drivetrain Design', 'Gear Systems', 'Innovation', 'Critical Thinking'], proficiencies: ['EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'ADVANCED'] },

    // Zoe Thompson (Junior Driver) - Driver + mechanical
    { studentId: 'student-4', skillNames: ['Strategy Development', 'Critical Thinking', 'Assembly Techniques', 'Hand Tools', 'Power Tools', 'Teamwork', 'Time Management', 'Gear Systems', 'Metal Fabrication'], proficiencies: ['ADVANCED', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE', 'INTERMEDIATE'] },

    // Jamal Washington (Junior Builder) - Mechanical expert
    { studentId: 'student-5', skillNames: ['Metal Fabrication', 'Power Tools', 'Hand Tools', 'Assembly Techniques', 'Gear Systems', 'Drivetrain Design', 'Prototyping', 'Wiring Basics', 'Innovation', 'Problem Solving', 'Teamwork'], proficiencies: ['ADVANCED', 'ADVANCED', 'EXPERT', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE', 'ADVANCED', 'INTERMEDIATE', 'ADVANCED'] },

    // Sophia Nguyen (Junior Notebook) - Documentation + design
    { studentId: 'student-6', skillNames: ['Technical Writing', 'Basic CAD', '3D Modeling', 'Technical Drawing', 'Presentation Skills', 'Teamwork', 'Time Management', 'Prototyping', 'Hand Tools'], proficiencies: ['ADVANCED', 'INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE', 'INTERMEDIATE'] },

    // Connor O'Brien (Junior Scout) - Analytics + strategy
    { studentId: 'student-7', skillNames: ['Data Analysis', 'Strategy Development', 'Critical Thinking', 'Presentation Skills', 'Python Basics', 'Teamwork', 'Time Management', 'Problem Solving'], proficiencies: ['ADVANCED', 'ADVANCED', 'ADVANCED', 'INTERMEDIATE', 'INTERMEDIATE', 'ADVANCED', 'ADVANCED', 'ADVANCED'] },

    // Maya Johnson (Sophomore Programmer) - Developing programmer
    { studentId: 'student-8', skillNames: ['Python Basics', 'C++ Programming', 'Debug & Testing', 'Sensor Integration', 'Basic CAD', 'Problem Solving', 'Teamwork', 'Critical Thinking'], proficiencies: ['INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE', 'BEGINNER', 'BEGINNER', 'INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE'] },

    // Lucas Anderson (Sophomore Builder) - Mechanical learner
    { studentId: 'student-9', skillNames: ['Hand Tools', 'Power Tools', 'Assembly Techniques', 'Gear Systems', 'Basic CAD', 'Wiring Basics', 'Teamwork', 'Metal Fabrication'], proficiencies: ['INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE', 'BEGINNER', 'BEGINNER', 'INTERMEDIATE', 'BEGINNER'] },

    // Priya Sharma (Sophomore Designer) - CAD learner
    { studentId: 'student-10', skillNames: ['Basic CAD', '3D Modeling', 'Technical Drawing', 'Prototyping', 'Hand Tools', 'Assembly Techniques', 'Teamwork', 'Innovation'], proficiencies: ['INTERMEDIATE', 'INTERMEDIATE', 'BEGINNER', 'BEGINNER', 'INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE'] },

    // Tyler Brown (Sophomore Member) - Generalist
    { studentId: 'student-11', skillNames: ['Hand Tools', 'Assembly Techniques', 'Teamwork', 'Basic CAD', 'Python Basics', 'Wiring Basics', 'Time Management'], proficiencies: ['INTERMEDIATE', 'INTERMEDIATE', 'INTERMEDIATE', 'BEGINNER', 'BEGINNER', 'BEGINNER', 'INTERMEDIATE'] },

    // Emma Davis (Freshman) - New, programming interest
    { studentId: 'student-12', skillNames: ['Python Basics', 'Teamwork', 'Hand Tools', 'Wiring Basics', 'Basic CAD'], proficiencies: ['BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER'] },

    // Ryan Garcia (Freshman Builder) - Mechanical beginner
    { studentId: 'student-13', skillNames: ['Hand Tools', 'Assembly Techniques', 'Teamwork', 'Power Tools', 'Wiring Basics', 'Metal Fabrication'], proficiencies: ['BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER'] },

    // Chloe Lee (Freshman Designer) - Design beginner
    { studentId: 'student-14', skillNames: ['Basic CAD', 'Hand Tools', 'Teamwork', 'Technical Drawing', 'Assembly Techniques'], proficiencies: ['BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER'] },

    // Noah Taylor (Freshman Programmer) - Programming beginner
    { studentId: 'student-15', skillNames: ['Python Basics', 'Teamwork', 'Hand Tools', 'Basic CAD', 'Debug & Testing', 'Wiring Basics'], proficiencies: ['BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER', 'BEGINNER'] },
  ]

  let totalSkillsAssigned = 0
  const now = new Date()
  for (const assignment of skillAssignments) {
    for (let i = 0; i < assignment.skillNames.length; i++) {
      const skillName = assignment.skillNames[i]
      const proficiency = assignment.proficiencies[i]
      const skill = createdSkills.find(s => s.name === skillName)

      if (skill) {
        // Spread assessment dates over the past 6 months
        const daysAgo = Math.floor(Math.random() * 180)
        const acquiredAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

        await prisma.studentSkill.upsert({
          where: {
            studentId_skillId: {
              studentId: assignment.studentId,
              skillId: skill.id,
            },
          },
          update: {},
          create: {
            id: `ss-${assignment.studentId}-${skill.id}`,
            studentId: assignment.studentId,
            skillId: skill.id,
            proficiency: proficiency as any,
            verified: proficiency === 'ADVANCED' || proficiency === 'EXPERT',
            verifiedAt: (proficiency === 'ADVANCED' || proficiency === 'EXPERT') ? acquiredAt : null,
            acquiredAt: acquiredAt,
          },
        })
        totalSkillsAssigned++
      }
    }
  }

  console.log(`✅ Assigned ${totalSkillsAssigned} skills to students with varied proficiency levels`)

  // Create comprehensive curriculum modules
  const modules = [
    {
      id: 'module-1',
      title: 'Safety Fundamentals',
      description: 'Essential safety training for all team members',
      category: 'SAFETY',
      level: 'BEGINNER',
      order: 1,
      objectives: ['Understand shop safety rules', 'Know how to use PPE', 'Identify hazards', 'Emergency procedures'],
      estimatedHours: 2,
    },
    {
      id: 'module-2',
      title: 'Introduction to VEX Robotics',
      description: 'Overview of VEX competition system and components',
      category: 'MECHANICAL',
      level: 'BEGINNER',
      order: 2,
      objectives: ['Identify VEX components', 'Understand game rules', 'Build simple mechanisms'],
      estimatedHours: 4,
    },
    {
      id: 'module-3',
      title: 'CAD Basics',
      description: 'Introduction to computer-aided design for robotics',
      category: 'CAD_DESIGN',
      level: 'BEGINNER',
      order: 3,
      objectives: ['Navigate CAD software', 'Create basic 3D models', 'Generate assemblies'],
      estimatedHours: 6,
    },
    {
      id: 'module-4',
      title: 'Hand Tools Mastery',
      description: 'Safe and effective use of hand tools',
      category: 'MECHANICAL',
      level: 'BEGINNER',
      order: 4,
      objectives: ['Use wrenches and screwdrivers', 'Cutting and filing techniques', 'Tool maintenance'],
      estimatedHours: 3,
    },
    {
      id: 'module-5',
      title: 'Programming Fundamentals',
      description: 'Introduction to robot programming',
      category: 'PROGRAMMING',
      level: 'BEGINNER',
      order: 5,
      objectives: ['Understanding C++ basics', 'VEX programming environment', 'Basic motor control'],
      estimatedHours: 8,
    },
    {
      id: 'module-6',
      title: 'Advanced CAD Techniques',
      description: 'Complex modeling and simulation',
      category: 'CAD_DESIGN',
      level: 'ADVANCED',
      order: 6,
      objectives: ['Advanced assemblies', 'Motion simulation', 'Stress analysis'],
      estimatedHours: 10,
    },
    {
      id: 'module-7',
      title: 'Autonomous Programming',
      description: 'Creating autonomous routines',
      category: 'PROGRAMMING',
      level: 'ADVANCED',
      order: 7,
      objectives: ['Sensor feedback loops', 'Path planning', 'Competition autonomous'],
      estimatedHours: 12,
    },
    {
      id: 'module-8',
      title: 'Engineering Notebook',
      description: 'Documentation and technical writing',
      category: 'NOTEBOOK',
      level: 'BEGINNER',
      order: 8,
      objectives: ['Design process documentation', 'Technical sketches', 'Judging preparation'],
      estimatedHours: 5,
    },
    {
      id: 'module-9',
      title: 'Competition Strategy',
      description: 'Match strategy and scouting',
      category: 'COMPETITION_STRATEGY',
      level: 'INTERMEDIATE',
      order: 9,
      objectives: ['Alliance selection', 'Match analysis', 'Strategic planning'],
      estimatedHours: 4,
    },
    {
      id: 'module-10',
      title: 'Team Leadership',
      description: 'Leadership and project management',
      category: 'SOFT_SKILLS',
      level: 'INTERMEDIATE',
      order: 10,
      objectives: ['Team communication', 'Project planning', 'Conflict resolution'],
      estimatedHours: 6,
    },
  ]

  const createdModules: any[] = []
  for (const module of modules) {
    const created = await prisma.curriculumModule.upsert({
      where: { id: module.id },
      update: {},
      create: module,
    })
    createdModules.push(created)
  }

  console.log(`✅ Created ${createdModules.length} curriculum modules`)

  // Seed Foundation Bootcamp milestones (Phase 2 infrastructure)
  await seedBootcampMilestones(prisma)

  // Assign curriculum progress to students (realistic progression)
  const curriculumProgress = [
    // Seniors - completed most modules
    { studentId: 'student-1', moduleIds: ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-8', 'module-9', 'module-10'], statuses: ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'MASTERED'] },
    { studentId: 'student-2', moduleIds: ['module-1', 'module-2', 'module-5', 'module-7', 'module-8', 'module-9'], statuses: ['COMPLETED', 'COMPLETED', 'MASTERED', 'MASTERED', 'COMPLETED', 'COMPLETED'] },
    { studentId: 'student-3', moduleIds: ['module-1', 'module-2', 'module-3', 'module-4', 'module-6', 'module-8'], statuses: ['COMPLETED', 'COMPLETED', 'MASTERED', 'COMPLETED', 'MASTERED', 'COMPLETED'] },

    // Juniors - mid-way through
    { studentId: 'student-4', moduleIds: ['module-1', 'module-2', 'module-4', 'module-5', 'module-9'], statuses: ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS'] },
    { studentId: 'student-5', moduleIds: ['module-1', 'module-2', 'module-4', 'module-3', 'module-8'], statuses: ['COMPLETED', 'COMPLETED', 'MASTERED', 'IN_PROGRESS', 'COMPLETED'] },
    { studentId: 'student-6', moduleIds: ['module-1', 'module-2', 'module-3', 'module-8', 'module-10'], statuses: ['COMPLETED', 'COMPLETED', 'COMPLETED', 'MASTERED', 'IN_PROGRESS'] },
    { studentId: 'student-7', moduleIds: ['module-1', 'module-2', 'module-5', 'module-9', 'module-10'], statuses: ['COMPLETED', 'COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS'] },

    // Sophomores - basic modules completed
    { studentId: 'student-8', moduleIds: ['module-1', 'module-2', 'module-5', 'module-7'], statuses: ['COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'] },
    { studentId: 'student-9', moduleIds: ['module-1', 'module-2', 'module-4', 'module-3'], statuses: ['COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS'] },
    { studentId: 'student-10', moduleIds: ['module-1', 'module-2', 'module-3', 'module-6'], statuses: ['COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'] },
    { studentId: 'student-11', moduleIds: ['module-1', 'module-2', 'module-4'], statuses: ['COMPLETED', 'COMPLETED', 'IN_PROGRESS'] },

    // Freshmen - just starting
    { studentId: 'student-12', moduleIds: ['module-1', 'module-2', 'module-5'], statuses: ['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'] },
    { studentId: 'student-13', moduleIds: ['module-1', 'module-2', 'module-4'], statuses: ['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'] },
    { studentId: 'student-14', moduleIds: ['module-1', 'module-2', 'module-3'], statuses: ['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'] },
    { studentId: 'student-15', moduleIds: ['module-1', 'module-2', 'module-5'], statuses: ['COMPLETED', 'COMPLETED', 'IN_PROGRESS'] },
  ]

  let totalProgressRecords = 0
  for (const progress of curriculumProgress) {
    for (let i = 0; i < progress.moduleIds.length; i++) {
      const moduleId = progress.moduleIds[i]
      const status = progress.statuses[i]

      const daysAgo = Math.floor(Math.random() * 120) + 10
      const startedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
      const completedAt = (status === 'COMPLETED' || status === 'MASTERED')
        ? new Date(startedAt.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000)
        : null

      await prisma.curriculumProgress.upsert({
        where: {
          studentId_moduleId: {
            studentId: progress.studentId,
            moduleId: moduleId,
          },
        },
        update: {},
        create: {
          studentId: progress.studentId,
          moduleId: moduleId,
          status: status as any,
          startedAt: status !== 'NOT_STARTED' ? startedAt : null,
          completedAt: completedAt,
          lastAccessedAt: status === 'IN_PROGRESS' ? new Date() : completedAt,
          quizScore: completedAt ? 85 + Math.random() * 15 : null,
          attempts: status !== 'NOT_STARTED' ? Math.floor(Math.random() * 3) + 1 : 0,
        },
      })
      totalProgressRecords++
    }
  }

  console.log(`✅ Created ${totalProgressRecords} curriculum progress records`)

  // Create comprehensive tasks with varied statuses and priorities
  const tasks = [
    // Completed tasks (past)
    {
      id: 'task-1',
      title: 'Complete safety training',
      description: 'All team members must complete safety fundamentals module before using shop equipment',
      category: 'GENERAL',
      priority: 'URGENT',
      status: 'COMPLETED',
      dueDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
      assignmentType: 'TEAM',
      assignedStudents: ['student-1', 'student-2', 'student-3', 'student-4'],
    },
    {
      id: 'task-2',
      title: 'Initial robot concept design',
      description: 'Brainstorm and sketch initial robot concepts for this season\'s game',
      category: 'DESIGN',
      priority: 'HIGH',
      status: 'COMPLETED',
      dueDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-1', 'student-3', 'student-6'],
    },
    {
      id: 'task-3',
      title: 'Build test drivetrain',
      description: 'Construct prototype drivetrain to test different gear ratios',
      category: 'BUILD',
      priority: 'HIGH',
      status: 'COMPLETED',
      dueDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-5', 'student-9', 'student-13'],
    },

    // In Progress tasks (current)
    {
      id: 'task-4',
      title: 'Design intake mechanism CAD',
      description: 'Create detailed CAD model for the intake system, including mounting points and gear ratios',
      category: 'DESIGN',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      assignmentType: 'INDIVIDUAL',
      assignedStudents: ['student-3'],
    },
    {
      id: 'task-5',
      title: 'Program autonomous routine',
      description: 'Develop autonomous program for match start - scoring preload and moving to goal',
      category: 'PROGRAMMING',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-2', 'student-8', 'student-15'],
    },
    {
      id: 'task-6',
      title: 'Build intake mechanism',
      description: 'Construct the intake system based on approved CAD design',
      category: 'BUILD',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-5', 'student-9'],
    },
    {
      id: 'task-7',
      title: 'Update engineering notebook',
      description: 'Document recent design decisions and build progress with photos and sketches',
      category: 'NOTEBOOK',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      assignmentType: 'INDIVIDUAL',
      assignedStudents: ['student-6'],
    },

    // TODO tasks (upcoming)
    {
      id: 'task-8',
      title: 'Test and tune PID controllers',
      description: 'Fine-tune PID values for drivetrain and lift system for smooth operation',
      category: 'PROGRAMMING',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-2', 'student-8'],
    },
    {
      id: 'task-9',
      title: 'Design team branding',
      description: 'Create team logo, banner, and pit display for competition',
      category: 'GENERAL',
      priority: 'LOW',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-14', 'student-10'],
    },
    {
      id: 'task-10',
      title: 'Scout local competition',
      description: 'Attend local competition to scout other teams and gather match data',
      category: 'COMPETITION_PREP',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
      assignmentType: 'INDIVIDUAL',
      assignedStudents: ['student-7'],
    },
    {
      id: 'task-11',
      title: 'Build lift mechanism',
      description: 'Construct vertical lift system for scoring in elevated goals',
      category: 'BUILD',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 17 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-5', 'student-9', 'student-13'],
    },
    {
      id: 'task-12',
      title: 'Prepare for skills challenge',
      description: 'Practice and optimize robot for programming and driver skills challenges',
      category: 'COMPETITION_PREP',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-2', 'student-4'],
    },
    {
      id: 'task-13',
      title: 'Fundraising event planning',
      description: 'Plan and organize team fundraising event for competition travel costs',
      category: 'FUNDRAISING',
      priority: 'LOW',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-1', 'student-6'],
    },
    {
      id: 'task-14',
      title: 'Practice driver skills',
      description: 'Regular practice sessions for driver to improve match performance',
      category: 'COMPETITION_PREP',
      priority: 'HIGH',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      assignmentType: 'INDIVIDUAL',
      assignedStudents: ['student-4'],
    },
    {
      id: 'task-15',
      title: 'Wire management cleanup',
      description: 'Organize and secure all wiring for better reliability and appearance',
      category: 'BUILD',
      priority: 'MEDIUM',
      status: 'TODO',
      dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      assignmentType: 'GROUP',
      assignedStudents: ['student-5', 'student-11'],
    },
  ]

  let totalTasksCreated = 0
  let totalTaskAssignments = 0
  for (const taskData of tasks) {
    await prisma.task.upsert({
      where: { id: taskData.id },
      update: {},
      create: {
        id: taskData.id,
        title: taskData.title,
        description: taskData.description,
        teamId: team.id,
        priority: taskData.priority as any,
        status: taskData.status as any,
        category: taskData.category as any,
        dueDate: taskData.dueDate,
        completedAt: taskData.completedAt,
        assignmentType: taskData.assignmentType as any,
      },
    })
    totalTasksCreated++

    // Assign students to tasks
    for (const studentId of taskData.assignedStudents) {
      await prisma.taskAssignment.upsert({
        where: {
          taskId_studentId: {
            taskId: taskData.id,
            studentId: studentId,
          },
        },
        update: {},
        create: {
          id: `ta-${taskData.id}-${studentId}`,
          taskId: taskData.id,
          studentId: studentId,
          status: taskData.status as any,
        },
      })
      totalTaskAssignments++
    }
  }

  console.log(`✅ Created ${totalTasksCreated} tasks with ${totalTaskAssignments} assignments`)

  // Create projects with student roles
  const projects = [
    {
      id: 'project-1',
      name: 'Competition Robot Build',
      description: 'Main competition robot for the 2025-2026 High Stakes season',
      category: 'ROBOT',
      status: 'IN_PROGRESS',
      startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      goals: ['Win regional championship', 'Qualify for state', 'Achieve 80% autonomous success rate'],
      outcomes: ['Completed drivetrain', 'Working intake system', '50% autonomous success rate'],
      roles: [
        { studentId: 'student-1', role: 'Project Lead', hoursSpent: 120, contributions: 'Overall project management, pneumatics design' },
        { studentId: 'student-2', role: 'Lead Programmer', hoursSpent: 85, contributions: 'Autonomous routines, PID tuning, sensor integration' },
        { studentId: 'student-3', role: 'Lead Designer', hoursSpent: 95, contributions: 'CAD design, drivetrain optimization, mechanism design' },
        { studentId: 'student-4', role: 'Lead Driver', hoursSpent: 110, contributions: 'Driver practice, match strategy, testing' },
        { studentId: 'student-5', role: 'Lead Builder', hoursSpent: 130, contributions: 'Metal fabrication, assembly, mechanism construction' },
        { studentId: 'student-6', role: 'Documentation Lead', hoursSpent: 75, contributions: 'Engineering notebook, design documentation' },
        { studentId: 'student-8', role: 'Programmer', hoursSpent: 45, contributions: 'Sensor code, debugging, testing' },
        { studentId: 'student-9', role: 'Builder', hoursSpent: 60, contributions: 'Assembly, power tool work, prototyping' },
        { studentId: 'student-10', role: 'Designer', hoursSpent: 40, contributions: 'CAD modeling, technical drawings' },
      ],
    },
    {
      id: 'project-2',
      name: 'Autonomous Skills Challenge',
      description: 'Optimized autonomous routine for skills competition',
      category: 'AUTONOMOUS',
      status: 'IN_PROGRESS',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      goals: ['Score 50+ points in autonomous', 'Achieve consistent performance', 'Optimize cycle times'],
      outcomes: ['Current best: 38 points', 'Improved consistency to 85%'],
      roles: [
        { studentId: 'student-2', role: 'Lead Developer', hoursSpent: 35, contributions: 'Path planning, optimization algorithms' },
        { studentId: 'student-8', role: 'Programmer', hoursSpent: 25, contributions: 'Vision sensor integration, testing' },
        { studentId: 'student-15', role: 'Learner', hoursSpent: 15, contributions: 'Code review, documentation, learning' },
        { studentId: 'student-7', role: 'Data Analyst', hoursSpent: 20, contributions: 'Performance tracking, analytics' },
      ],
    },
    {
      id: 'project-3',
      name: 'Intake Subsystem',
      description: 'Efficient intake mechanism for game objects',
      category: 'MECHANISM',
      status: 'TESTING',
      startDate: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
      goals: ['Fast and reliable intake', 'Handle multiple object orientations', 'Minimize size and weight'],
      outcomes: ['Working prototype', 'Intake speed: 0.8 seconds per object', 'Weight: 2.5 lbs'],
      roles: [
        { studentId: 'student-3', role: 'Designer', hoursSpent: 28, contributions: 'CAD design, gear ratio calculations' },
        { studentId: 'student-5', role: 'Lead Builder', hoursSpent: 35, contributions: 'Fabrication, assembly, iteration' },
        { studentId: 'student-9', role: 'Builder', hoursSpent: 30, contributions: 'Assembly, testing, adjustments' },
        { studentId: 'student-10', role: 'Design Support', hoursSpent: 12, contributions: 'CAD modeling, technical drawings' },
        { studentId: 'student-4', role: 'Tester', hoursSpent: 20, contributions: 'Field testing, feedback, refinement' },
      ],
    },
    {
      id: 'project-4',
      name: 'Team Outreach Program',
      description: 'Community outreach and mentoring for local middle schools',
      category: 'OUTREACH',
      status: 'IN_PROGRESS',
      startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      goals: ['Mentor 3 middle school teams', 'Host robotics workshop', 'Inspire next generation'],
      outcomes: ['Mentoring 2 teams currently', 'Workshop planned for next month'],
      roles: [
        { studentId: 'student-1', role: 'Program Coordinator', hoursSpent: 40, contributions: 'Program planning, coordination, outreach' },
        { studentId: 'student-6', role: 'Mentor', hoursSpent: 35, contributions: 'Teaching, mentoring, workshop development' },
        { studentId: 'student-11', role: 'Assistant Mentor', hoursSpent: 25, contributions: 'Assisting workshops, materials preparation' },
      ],
    },
    {
      id: 'project-5',
      name: 'Pneumatics System',
      description: 'High-pressure pneumatic system for lift and clamp mechanisms',
      category: 'MECHANISM',
      status: 'COMPLETED',
      startDate: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      completedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      goals: ['Fast actuation', 'Reliable operation', 'Efficient air usage'],
      outcomes: ['Actuation time: 0.3 seconds', '100% reliability in testing', 'Optimized air consumption'],
      roles: [
        { studentId: 'student-1', role: 'Lead Engineer', hoursSpent: 50, contributions: 'System design, implementation, testing' },
        { studentId: 'student-5', role: 'Builder', hoursSpent: 42, contributions: 'Plumbing, mounting, assembly' },
        { studentId: 'student-9', role: 'Assistant', hoursSpent: 28, contributions: 'Assembly, leak testing, maintenance' },
      ],
    },
  ]

  let totalProjectsCreated = 0
  let totalProjectRoles = 0
  for (const projectData of projects) {
    await prisma.project.upsert({
      where: { id: projectData.id },
      update: {},
      create: {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        teamId: team.id,
        category: projectData.category as any,
        status: projectData.status as any,
        startDate: projectData.startDate,
        completedAt: projectData.completedAt,
        goals: projectData.goals,
        outcomes: projectData.outcomes,
      },
    })
    totalProjectsCreated++

    // Assign student roles to projects
    for (const roleData of projectData.roles) {
      await prisma.projectRole.upsert({
        where: {
          projectId_studentId: {
            projectId: projectData.id,
            studentId: roleData.studentId,
          },
        },
        update: {},
        create: {
          id: `pr-${projectData.id}-${roleData.studentId}`,
          projectId: projectData.id,
          studentId: roleData.studentId,
          role: roleData.role,
          hoursSpent: roleData.hoursSpent,
          contributions: roleData.contributions,
        },
      })
      totalProjectRoles++
    }
  }

  console.log(`✅ Created ${totalProjectsCreated} projects with ${totalProjectRoles} student roles`)

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${createdSkills.length} skills`)
  console.log(`   - ${createdStudents.length} students with diverse backgrounds`)
  console.log(`   - ${totalSkillsAssigned} skill assessments`)
  console.log(`   - ${createdModules.length} curriculum modules`)
  console.log(`   - ${totalProgressRecords} curriculum progress records`)
  console.log(`   - ${totalTasksCreated} tasks with ${totalTaskAssignments} assignments`)
  console.log(`   - ${totalProjectsCreated} projects with ${totalProjectRoles} student roles`)
  console.log('\n📧 Login credentials:')
  console.log('   Email: coach@robotics.com')
  console.log('   Password: password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
