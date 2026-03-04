import { PrismaClient, CurriculumCategory, SkillLevel } from '@prisma/client'

/**
 * Seed Foundation Bootcamp curriculum milestones
 *
 * Creates 7 CurriculumModule records representing the Foundation Bootcamp
 * milestones from Phase 1. These modules track student progress through
 * the 4-6 week bootcamp.
 */
export async function seedBootcampMilestones(prisma: PrismaClient) {
  console.log('🎯 Seeding Foundation Bootcamp milestones...')

  const bootcampMilestones = [
    {
      id: 'bootcamp-01',
      title: 'VEX V5 Drivetrain Build',
      description: 'Students learn fundamental mechanical assembly by building a functional VEX V5 drivetrain. This hands-on module covers structural design, motor mounting, gear ratios, and wheel selection. Students gain proficiency with VEX metal parts, fasteners, and basic structural engineering principles.',
      category: CurriculumCategory.MECHANICAL,
      order: 1,
      level: SkillLevel.BEGINNER,
      estimatedHours: 4,
      objectives: [
        'Assemble VEX metal structure using rails, channels, and gussets',
        'Mount and gear motors for optimal torque and speed',
        'Install and align wheels for smooth drivetrain operation',
      ],
      active: true,
    },
    {
      id: 'bootcamp-02',
      title: 'CAD Skills - Onshape Drivetrain Design',
      description: 'Students design their drivetrain in Onshape before building the physical robot. This CAD-first approach teaches 3D modeling, part libraries, assembly constraints, and generates accurate parts lists. Students learn to catch design mistakes early and iterate digitally before physical fabrication.',
      category: CurriculumCategory.CAD_DESIGN,
      order: 2,
      level: SkillLevel.BEGINNER,
      estimatedHours: 3,
      objectives: [
        'Navigate Onshape CAD interface and VEX part library',
        'Create 3D assembly of drivetrain with proper constraints',
        'Generate parts list and detect design issues before building',
      ],
      active: true,
    },
    {
      id: 'bootcamp-03',
      title: 'Fabrication Skills - Physical Build',
      description: 'Students execute their CAD design by physically building the VEX drivetrain. This module emphasizes precision measurement, proper use of hand tools, and incremental testing methodology. Students learn to read technical drawings, follow assembly sequences, and troubleshoot mechanical issues.',
      category: CurriculumCategory.MECHANICAL,
      order: 3,
      level: SkillLevel.BEGINNER,
      estimatedHours: 4,
      objectives: [
        'Use wrenches, screwdrivers, and cutting tools safely and effectively',
        'Follow CAD design to build accurate physical assembly',
        'Test components incrementally to catch errors early',
      ],
      active: true,
    },
    {
      id: 'bootcamp-04',
      title: 'Electronics Skills - Motors and Sensors',
      description: 'Students wire the V5 Brain, motors, and sensors to create a functional electronic system. This module covers port configuration, cable management, power distribution, and basic electronics safety. Students learn to diagnose wiring issues and understand the electronic architecture of competition robots.',
      category: CurriculumCategory.ELECTRICAL,
      order: 4,
      level: SkillLevel.BEGINNER,
      estimatedHours: 3,
      objectives: [
        'Connect V5 motors and sensors to brain with proper port configuration',
        'Implement clean cable management for reliability',
        'Diagnose and troubleshoot common wiring issues',
      ],
      active: true,
    },
    {
      id: 'bootcamp-05',
      title: 'Programming Basics - VEXcode Blocks',
      description: 'Students program their robot using VEXcode Blocks, learning both autonomous and driver control code. The curriculum uses VEXcode Blocks with the Switch feature, allowing gradual transition to Python without starting over. Students learn control flow, motor commands, and competition code structure.',
      category: CurriculumCategory.PROGRAMMING,
      order: 5,
      level: SkillLevel.BEGINNER,
      estimatedHours: 4,
      objectives: [
        'Write autonomous code for robot movement and scoring',
        'Implement driver control with joystick mapping',
        'Use competition template to separate autonomous and driver phases',
      ],
      active: true,
    },
    {
      id: 'bootcamp-06',
      title: 'Safety Training and Workspace Certification',
      description: 'Students complete mandatory safety training to access workshop tools independently. This non-negotiable module covers shop hazards, proper tool usage, personal protective equipment (PPE), and emergency procedures. Students must pass a safety quiz and complete a signed checklist before workshop access is granted.',
      category: CurriculumCategory.SAFETY,
      order: 6,
      level: SkillLevel.BEGINNER,
      estimatedHours: 2,
      objectives: [
        'Identify shop hazards and demonstrate proper safety protocols',
        'Pass safety quiz with 100% accuracy',
        'Complete signed safety checklist for workspace certification',
      ],
      active: true,
    },
    {
      id: 'bootcamp-07',
      title: '1v1 Soccer Competition Finale',
      description: 'Students compete in a participation-based 1v1 soccer competition that emphasizes learning over winning. This culminating event demonstrates all four core skills (mechanical, CAD, electronics, programming) in action. The competition uses a bracket format with randomized matchups and best-of-3 matches to maximize engagement.',
      category: CurriculumCategory.COMPETITION_STRATEGY,
      order: 7,
      level: SkillLevel.BEGINNER,
      estimatedHours: 2,
      objectives: [
        'Demonstrate functional robot with autonomous and driver control',
        'Apply strategy and adaptability during competitive matches',
        'Experience full competition workflow from pit setup to match play',
      ],
      active: true,
    },
  ]

  let seededCount = 0
  for (const milestone of bootcampMilestones) {
    await prisma.curriculumModule.upsert({
      where: { id: milestone.id },
      update: {
        // Update fields if milestone already exists (allows schema evolution)
        title: milestone.title,
        description: milestone.description,
        category: milestone.category,
        order: milestone.order,
        level: milestone.level,
        estimatedHours: milestone.estimatedHours,
        objectives: milestone.objectives,
        active: milestone.active,
      },
      create: milestone,
    })
    seededCount++
  }

  console.log(`✅ Seeded ${seededCount} bootcamp milestones (orders 1-7)`)

  return seededCount
}
