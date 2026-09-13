import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding SIH 26043 database...')

  // ─── DEMO USERS ──────────────────────────────────────────────────────────────

  const hash = await bcrypt.hash('demo1234', 10)

  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@demo.sih' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'citizen@demo.sih',
      password: hash,
      role: 'CITIZEN',
      citizen: {
        create: {
          phone: '+91-9876543210',
          address: '45, MG Road, Sector 12',
          city: 'Chandigarh',
          state: 'Punjab',
        },
      },
    },
  })

  const govt = await prisma.user.upsert({
    where: { email: 'govt@demo.sih' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'govt@demo.sih',
      password: hash,
      role: 'GOVERNMENT',
      government: {
        create: {
          authority: 'Municipal Corporation of Chandigarh',
          department: 'Urban Development',
          jurisdiction: 'Chandigarh District',
          designation: 'Deputy Commissioner',
        },
      },
    },
  })

  const university = await prisma.user.upsert({
    where: { email: 'university@demo.sih' },
    update: {},
    create: {
      name: 'Dr. Anil Verma',
      email: 'university@demo.sih',
      password: hash,
      role: 'UNIVERSITY',
      university: {
        create: {
          university: 'Punjab Engineering College',
          department: 'Research & Development',
          designation: 'Director, Innovation Cell',
        },
      },
    },
  })

  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@demo.sih' },
    update: {},
    create: {
      name: 'Prof. Kavitha Reddy',
      email: 'faculty@demo.sih',
      password: hash,
      role: 'FACULTY',
      faculty: {
        create: {
          university: 'Punjab Engineering College',
          department: 'Civil Engineering',
          expertise: 'Urban Water Management, Smart Infrastructure, IoT Systems',
          designation: 'Associate Professor',
        },
      },
    },
  })

  const industry = await prisma.user.upsert({
    where: { email: 'industry@demo.sih' },
    update: {},
    create: {
      name: 'Suresh Mehta',
      email: 'industry@demo.sih',
      password: hash,
      role: 'INDUSTRY',
      industry: {
        create: {
          company: 'SmartCity Solutions Pvt. Ltd.',
          sector: 'Smart Infrastructure & IoT',
          website: 'https://smartcitysolutions.in',
        },
      },
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.sih' },
    update: { accountStatus: 'APPROVED' },
    create: {
      name: 'Central Platform Administrator',
      email: 'admin@demo.sih',
      password: hash,
      role: 'ADMIN',
      accountStatus: 'APPROVED',
    },
  })

  // ─── DEMO ORGANIZATIONS ───────────────────────────────────────────────────

  const mccOrg = await prisma.organization.upsert({
    where: { code: 'ORG-MCC-01' },
    update: {},
    create: {
      name: 'Municipal Corporation of Chandigarh',
      code: 'ORG-MCC-01',
      type: 'MUNICIPALITY',
      state: 'Punjab',
      district: 'Chandigarh',
      department: 'Urban Development & Public Works',
      status: 'APPROVED',
    },
  })

  const pecOrg = await prisma.organization.upsert({
    where: { code: 'ORG-PEC-01' },
    update: {},
    create: {
      name: 'Punjab Engineering College',
      code: 'ORG-PEC-01',
      type: 'UNIVERSITY',
      state: 'Punjab',
      district: 'Chandigarh',
      department: 'Civil & Environmental Engineering',
      status: 'APPROVED',
    },
  })

  const smartCityOrg = await prisma.organization.upsert({
    where: { code: 'ORG-SCS-01' },
    update: {},
    create: {
      name: 'SmartCity Solutions Pvt. Ltd.',
      code: 'ORG-SCS-01',
      type: 'INDUSTRY_PARTNER',
      state: 'Punjab',
      district: 'Chandigarh',
      department: 'Smart Infrastructure & IoT',
      status: 'APPROVED',
    },
  })

  // Link Memberships
  await prisma.organizationMembership.upsert({
    where: { userId_orgId: { userId: govt.id, orgId: mccOrg.id } },
    update: {},
    create: {
      userId: govt.id,
      orgId: mccOrg.id,
      role: 'OFFICER',
      designation: 'Deputy Commissioner',
      status: 'APPROVED',
      isPrimary: true,
    },
  })

  await prisma.organizationMembership.upsert({
    where: { userId_orgId: { userId: university.id, orgId: pecOrg.id } },
    update: {},
    create: {
      userId: university.id,
      orgId: pecOrg.id,
      role: 'HEAD',
      designation: 'Director, Innovation Cell',
      status: 'APPROVED',
      isPrimary: true,
    },
  })

  await prisma.organizationMembership.upsert({
    where: { userId_orgId: { userId: faculty.id, orgId: pecOrg.id } },
    update: {},
    create: {
      userId: faculty.id,
      orgId: pecOrg.id,
      role: 'MEMBER',
      designation: 'Associate Professor',
      status: 'APPROVED',
      isPrimary: true,
    },
  })

  await prisma.organizationMembership.upsert({
    where: { userId_orgId: { userId: industry.id, orgId: smartCityOrg.id } },
    update: {},
    create: {
      userId: industry.id,
      orgId: smartCityOrg.id,
      role: 'HEAD',
      designation: 'Managing Director',
      status: 'APPROVED',
      isPrimary: true,
    },
  })

  // ─── DEMO PROBLEM ─────────────────────────────────────────────────────────

  const existingProblem = await prisma.problem.findUnique({
    where: { referenceId: 'PRB-2026-00001' },
  })

  if (!existingProblem) {
    const problem = await prisma.problem.create({
      data: {
        referenceId: 'PRB-2026-00001',
        citizenId: citizen.id,
        title: 'Frequent flooding near Government School No. 4 due to blocked storm drains',
        description:
          'The storm drains near Government School No. 4 in Sector 12 have been blocked for the past two monsoon seasons. Every year during heavy rains, the entire road and school ground floods to 2–3 feet. Children are unable to attend school during rains. Several vehicles have been damaged. The local municipal office has been informed multiple times but no action has been taken. The problem has been worsening and needs urgent intervention.',
        category: 'DRAINAGE_FLOODING',
        location: 'Sector 12, Near Government School No. 4',
        municipality: 'Municipal Corporation of Chandigarh',
        district: 'Chandigarh',
        state: 'Punjab',
        affectedPopulation: 4500,
        status: 'SOLUTION_DEVELOPMENT',
        aiCategory: 'Urban Drainage / Flooding',
        aiSeverity: 'HIGH',
        aiRecommendedDepts: JSON.stringify([
          'Civil Engineering',
          'Computer Science',
          'Electronics & IoT',
          'Environmental Science',
        ]),
        evidence: {
          create: [
            {
              fileUrl: '/uploads/demo/flood-photo-1.jpg',
              fileType: 'image',
              fileName: 'School flooding during monsoon 2025.jpg',
            },
            {
              fileUrl: '/uploads/demo/flood-photo-2.jpg',
              fileType: 'image',
              fileName: 'Blocked drain near school gate.jpg',
            },
          ],
        },
      },
    })

    // Government Verification
    const verification = await prisma.problemVerification.create({
      data: {
        problemId: problem.id,
        govOfficerId: govt.id,
        status: 'VERIFIED',
        remarks:
          'Field inspection conducted on 15 August 2026. Municipal engineers confirmed complete blockage of two main storm drains due to debris and encroachment. Issue affecting school attendance and road safety. Officially verified for university intervention.',
        municipalityInput:
          'Municipal Corporation survey confirms 3 major drainage blockages. Estimated 4,500 residents affected. Issue classified as HIGH priority.',
        verifiedAt: new Date('2026-08-20T10:00:00Z'),
      },
    })

    // University Project
    const project = await prisma.universityProject.create({
      data: {
        problemId: problem.id,
        universityId: university.id,
        title: 'Smart Drainage Monitoring & Management System — Sector 12 Chandigarh',
        description:
          'A multidisciplinary project to design, develop and deploy a smart IoT-based drainage monitoring and alert system, combined with structural drainage improvements, to permanently solve the flooding problem near Government School No. 4.',
        status: 'IN_PROGRESS',
      },
    })

    // Faculty Leader Assignment
    await prisma.facultyLeaderAssignment.create({
      data: {
        projectId: project.id,
        facultyId: faculty.id,
      },
    })

    // University Team
    const team = await prisma.universityTeam.create({
      data: {
        projectId: project.id,
        name: 'Project FloodGuard — PEC Multidisciplinary Team',
        description:
          'Multidisciplinary team combining Civil Engineering, Computer Science, Electronics & IoT, and Environmental Science expertise to deliver an integrated smart drainage solution.',
        members: {
          create: [
            {
              userId: faculty.id,
              role: 'Faculty Leader',
              discipline: 'Civil Engineering',
              department: 'Civil Engineering',
              responsibilities:
                'Academic oversight, project direction, government liaison, final solution approval',
            },
            {
              userId: university.id,
              role: 'Project Coordinator',
              discipline: 'Administration',
              department: 'Research & Development',
              responsibilities: 'University coordination, resource allocation, industry liaison',
            },
          ],
        },
      },
    })

    // Milestones
    const milestones = [
      { title: 'Problem Research & Literature Review', order: 1, completedAt: new Date('2026-09-01') },
      { title: 'Root Cause Analysis', order: 2, completedAt: new Date('2026-09-05') },
      { title: 'Field Study & Data Collection', order: 3, completedAt: new Date('2026-09-08') },
      { title: 'Solution Design & Architecture', order: 4, dueDate: new Date('2026-09-20') },
      { title: 'IoT Sensor Prototype Development', order: 5, dueDate: new Date('2026-10-05') },
      { title: 'Software Platform Development', order: 6, dueDate: new Date('2026-10-20') },
      { title: 'Integration & Testing', order: 7, dueDate: new Date('2026-11-01') },
      { title: 'Government Solution Submission', order: 8, dueDate: new Date('2026-11-10') },
      { title: 'Industry Collaboration & Deployment', order: 9, dueDate: new Date('2026-12-01') },
      { title: 'Impact Measurement', order: 10, dueDate: new Date('2027-01-15') },
    ]

    for (const m of milestones) {
      await prisma.milestone.create({
        data: { projectId: project.id, ...m },
      })
    }

    // Tasks
    const tasks = [
      { title: 'Conduct literature review on urban drainage systems', status: 'COMPLETED', assigneeId: faculty.id },
      { title: 'Map all drainage points in Sector 12', status: 'COMPLETED', assigneeId: faculty.id },
      { title: 'Collect rainfall and flooding data (2023–2026)', status: 'COMPLETED', assigneeId: university.id },
      { title: 'Design IoT sensor placement plan', status: 'IN_PROGRESS', assigneeId: faculty.id },
      { title: 'Develop water-level monitoring dashboard wireframes', status: 'IN_PROGRESS', assigneeId: university.id },
      { title: 'Select microcontroller and sensor specifications', status: 'TODO' },
      { title: 'Draft solution proposal document', status: 'TODO', assigneeId: faculty.id },
      { title: 'Prepare cost estimation report', status: 'TODO' },
    ]

    for (const t of tasks) {
      await prisma.task.create({ data: { projectId: project.id, ...t } })
    }

    // Solution (draft)
    await prisma.solution.create({
      data: {
        projectId: project.id,
        problemStatement:
          'Recurring urban flooding near Government School No. 4, Sector 12, Chandigarh due to blocked and inadequate storm drain infrastructure, causing school closures, property damage, and public safety risk.',
        rootCause:
          'Primary causes: (1) Storm drain blockage due to accumulated debris and encroachment, (2) Insufficient drain capacity for peak monsoon runoff, (3) No real-time monitoring system to predict or detect flooding in advance.',
        proposedSolution:
          'Integrated Smart Drainage Management System: (1) Physical clearing and upgrading of blocked drains, (2) IoT-based water level sensors at 8 critical points, (3) Real-time monitoring dashboard accessible to municipal authorities, (4) SMS/app alerts for school administration and residents, (5) Predictive flood risk model using weather and sensor data.',
        technicalApproach:
          'Hardware: ESP32 microcontrollers with ultrasonic water-level sensors. Connectivity: LoRaWAN network for reliable low-power communication. Platform: React-based monitoring dashboard with Node.js backend. AI/ML: Flood prediction model using historical rainfall and sensor data. Infrastructure: Structural drain upgrades by Civil Engineering team.',
        expectedImpact:
          'Elimination of flooding at school location, protection of 4,500 residents, reduction in school closure days from ~15/year to <2, real-time visibility for municipal authorities, 60% faster emergency response.',
        estimatedCost: 2850000,
        implementationPlan:
          'Phase 1 (Month 1): Sensor procurement and infrastructure preparation. Phase 2 (Month 2): Sensor deployment and network setup. Phase 3 (Month 2-3): Dashboard and alert system development. Phase 4 (Month 3): Integration testing and calibration. Phase 5 (Month 4): Full deployment and handover to municipal authorities.',
        timeline: '4 months from industry collaboration confirmation',
        requiredResources:
          '8x ESP32 sensors, LoRaWAN gateway, server infrastructure, civil works for drain upgrades, installation team',
        sustainabilityPlan:
          'Municipal authority to take over platform operations. Maintenance schedule built into system. Open-source codebase for local IT team. Annual sensor calibration protocol. Community awareness program.',
        status: 'DRAFT',
      },
    })

    // Audit Log entries
    const auditEntries = [
      {
        action: 'Problem Submitted',
        previousStatus: null,
        newStatus: 'SUBMITTED',
        remarks: 'Citizen submitted problem report with photographic evidence.',
        createdAt: new Date('2026-08-10T08:30:00Z'),
        userId: citizen.id,
      },
      {
        action: 'Verification Initiated',
        previousStatus: 'SUBMITTED',
        newStatus: 'UNDER_VERIFICATION',
        remarks: 'Government officer initiated field verification process.',
        createdAt: new Date('2026-08-12T10:00:00Z'),
        userId: govt.id,
      },
      {
        action: 'Problem Verified',
        previousStatus: 'UNDER_VERIFICATION',
        newStatus: 'VERIFIED',
        remarks:
          'Field inspection complete. Municipal Corporation confirms flooding issue. Problem officially verified.',
        createdAt: new Date('2026-08-20T10:00:00Z'),
        userId: govt.id,
      },
      {
        action: 'Problem Sent to University',
        previousStatus: 'VERIFIED',
        newStatus: 'UNDER_UNIVERSITY_REVIEW',
        remarks: 'Verified problem forwarded to Punjab Engineering College for review.',
        createdAt: new Date('2026-08-22T09:00:00Z'),
        userId: govt.id,
      },
      {
        action: 'Problem Accepted by University',
        previousStatus: 'UNDER_UNIVERSITY_REVIEW',
        newStatus: 'ACCEPTED',
        remarks:
          'Punjab Engineering College accepts the problem. Interdisciplinary project created.',
        createdAt: new Date('2026-08-25T11:00:00Z'),
        userId: university.id,
      },
      {
        action: 'Project Team Formed',
        previousStatus: 'ACCEPTED',
        newStatus: 'TEAM_FORMATION',
        remarks:
          'Multidisciplinary team "Project FloodGuard" created. Faculty Leader Prof. Kavitha Reddy assigned.',
        createdAt: new Date('2026-08-28T14:00:00Z'),
        userId: university.id,
      },
      {
        action: 'Solution Development Started',
        previousStatus: 'TEAM_FORMATION',
        newStatus: 'SOLUTION_DEVELOPMENT',
        remarks:
          'Team has begun problem research. Three milestones already completed: Literature Review, Root Cause Analysis, Field Study.',
        createdAt: new Date('2026-09-01T09:00:00Z'),
        userId: faculty.id,
      },
    ]

    for (const entry of auditEntries) {
      await prisma.auditLog.create({
        data: {
          problemId: problem.id,
          projectId: project.id,
          userId: entry.userId,
          action: entry.action,
          previousStatus: entry.previousStatus ?? undefined,
          newStatus: entry.newStatus,
          remarks: entry.remarks,
          createdAt: entry.createdAt,
        },
      })
    }

    console.log('✅ Demo problem PRB-2026-00001 created with full lifecycle data')
  }

  // ─── ADDITIONAL RICH DEMO PROBLEMS (Covering All Lifecycle Stages) ─────────

  // 1. TOPMOST CRITICAL EMERGENCY (Demonstrates Feature 2 & Topmost Sorting)
  const emergencyProblem = await prisma.problem.upsert({
    where: { referenceId: 'PRB-2026-EMG-01' },
    update: {},
    create: {
      referenceId: 'PRB-2026-EMG-01',
      citizenId: citizen.id,
      title: 'EMERGENCY: High-voltage 11kV live line snapped into flooded street near Primary Health Centre',
      description: 'An 11kV high-voltage power transmission wire has broken and fallen into 1.5 ft deep flood water right outside the primary health centre and emergency room entrance. Active electrical sparking is occurring in water. Multiple pedestrians and ambulances are stuck and there is extreme risk of fatal electrocution.',
      category: 'ELECTRICITY',
      location: 'Sector 15, Near Sub-Divisional Hospital & Market',
      municipality: 'Municipal Corporation of Chandigarh',
      district: 'Chandigarh',
      state: 'Punjab',
      affectedPopulation: 8500,
      status: 'SUBMITTED',
      isEmergency: true,
      emergencyReason:
        'Live sparking 11kV power line snapped into 1.5 ft standing rainwater directly adjacent to Sector 15 Hospital entrance. Acute electrocution hazard for emergency vehicles and pedestrians.',
      aiCategory: 'ELECTRICITY',
      aiSeverity: 'CRITICAL',
      aiRecommendedDepts: JSON.stringify([
        'Electrical Engineering',
        'Disaster Management',
        'Municipal Rapid Response',
      ]),
      aiSuggestions: JSON.stringify([
        'Immediate feeder breaker trip at Sector 15 Substation via SCADA control',
        'Deploy mobile physical barricades and high-visibility warning flags in 50m radius',
        'Dispatch emergency municipal de-watering pump unit to drain standing water',
        'Coordinate joint inspection between Municipal Corporation and State Electricity Board',
      ]),
      createdAt: new Date(),
    },
  })

  // 2. STAGE 2: UNDER_VERIFICATION (Drinking Water Contamination)
  const waterProblem = await prisma.problem.upsert({
    where: { referenceId: 'PRB-2026-00002' },
    update: {},
    create: {
      referenceId: 'PRB-2026-00002',
      citizenId: citizen.id,
      title: 'Contaminated drinking water pipeline supply in Urban Ward 9',
      description: 'Municipal tap water has turned yellowish with foul sulfur smell for over a week across Sector 14. Over 40 residents have fallen ill with gastrointestinal infections. Immediate testing and pipeline maintenance required.',
      category: 'WATER_SUPPLY',
      location: 'Ward 9, Old Market Complex, Sector 14',
      municipality: 'Municipal Corporation of Chandigarh',
      district: 'Chandigarh',
      state: 'Punjab',
      affectedPopulation: 3400,
      status: 'UNDER_VERIFICATION',
      isEmergency: false,
      aiCategory: 'WATER_SUPPLY',
      aiSeverity: 'HIGH',
      aiRecommendedDepts: JSON.stringify(['Civil & Environmental Engineering', 'Public Health Engineering']),
      aiSuggestions: JSON.stringify([
        'Collect bacteriological and chemical water samples at 5 distribution points',
        'Issue temporary boiling and filtration advisory to ward residents',
        'Pressure-test municipal main to detect cross-contamination with drainage channel',
      ]),
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
  })

  await prisma.problemVerification.upsert({
    where: { problemId: waterProblem.id },
    update: {},
    create: {
      problemId: waterProblem.id,
      govOfficerId: govt.id,
      status: 'UNDER_VERIFICATION',
      remarks: 'Field engineer dispatched to collect water samples from Ward 9 distribution overhead tank.',
      siteVisited: true,
      evidenceReviewed: true,
      recommendedDept: 'Water Supply & Sewerage Board',
      priorityScore: 78,
    },
  })

  // 3. STAGE 3: VERIFIED (Ready for University Adoption)
  const bridgeProblem = await prisma.problem.upsert({
    where: { referenceId: 'PRB-2026-00003' },
    update: {},
    create: {
      referenceId: 'PRB-2026-00003',
      citizenId: citizen.id,
      title: 'Structural scour and foundation cracking at Sector 4 pedestrian footbridge over canal',
      description: 'Severe erosion and underwater scour has exposed foundation piles of the main pedestrian footbridge connecting Sector 4 to Metro station. Noticeable vibrations occur under pedestrian load.',
      category: 'INFRASTRUCTURE',
      location: 'Sector 4 Canal Footbridge, Connecting Residential Zone to Metro',
      municipality: 'Municipal Corporation of Chandigarh',
      district: 'Chandigarh',
      state: 'Punjab',
      affectedPopulation: 6800,
      status: 'VERIFIED',
      isEmergency: false,
      aiCategory: 'INFRASTRUCTURE',
      aiSeverity: 'HIGH',
      aiRecommendedDepts: JSON.stringify(['Civil Engineering', 'Structural Dynamics', 'Materials Science']),
      aiSuggestions: JSON.stringify([
        'Perform non-destructive ultrasonic concrete testing on support pier 2',
        'Design micro-pile foundation underpinning to resist seasonal canal bed scour',
        'Install digital strain-gauge telemetry for real-time deflection monitoring',
      ]),
      createdAt: new Date(Date.now() - 5 * 86400000),
    },
  })

  await prisma.problemVerification.upsert({
    where: { problemId: bridgeProblem.id },
    update: {},
    create: {
      problemId: bridgeProblem.id,
      govOfficerId: govt.id,
      status: 'VERIFIED',
      remarks: 'Certified by Municipal Structural Engineer. Foundation scour confirmed; routed to PEC Civil Engineering.',
      siteVisited: true,
      evidenceReviewed: true,
      populationValidated: true,
      recommendedDept: 'Public Works Department (Bridges Wing)',
      priorityScore: 84,
      verifiedAt: new Date(Date.now() - 3 * 86400000),
    },
  })

  // 4. STAGE 5/6: GOVERNMENT_VALIDATION (Completed Solution Awaiting Govt Rubric Review)
  const wasteProblem = await prisma.problem.upsert({
    where: { referenceId: 'PRB-2026-00004' },
    update: {},
    create: {
      referenceId: 'PRB-2026-00004',
      citizenId: citizen.id,
      title: 'Automated Solar-Powered Solid Waste Segregation & Bio-methanation Unit',
      description: 'The vegetable and grain mandi dumps over 4.2 tons of mixed organic and non-biodegradable packaging daily into open drains, causing severe odor, pest breeding, and civic pollution.',
      category: 'SANITATION',
      location: 'Sector 26 Grain Market & Mandi Area',
      municipality: 'Municipal Corporation of Chandigarh',
      district: 'Chandigarh',
      state: 'Punjab',
      affectedPopulation: 12000,
      status: 'GOVERNMENT_VALIDATION',
      isEmergency: false,
      aiCategory: 'SANITATION',
      aiSeverity: 'HIGH',
      aiRecommendedDepts: JSON.stringify(['Mechanical Engineering', 'Environmental Science', 'Computer Vision']),
      createdAt: new Date(Date.now() - 20 * 86400000),
    },
  })

  const wasteProject = await prisma.universityProject.upsert({
    where: { problemId: wasteProblem.id },
    update: {},
    create: {
      problemId: wasteProblem.id,
      universityId: university.id,
      title: 'Smart Waste Segregator & Bio-gas Energy Capture Prototype',
      description: 'AI-assisted optical segregation of organic versus non-biodegradable commercial mandi waste.',
      status: 'SOLUTION_SUBMITTED',
    },
  })

  await prisma.solution.upsert({
    where: { projectId: wasteProject.id },
    update: {},
    create: {
      projectId: wasteProject.id,
      problemStatement: 'Massive organic waste generation (4.2 tons/day) leading to methane release and odor in commercial mandi.',
      rootCause: 'Lack of segregated disposal at vendor points and manual labor shortage for sorting.',
      proposedSolution: 'Automated dual-chamber conveyor with AI camera segregation and 250kg anaerobic digestion digester.',
      technicalApproach: 'Computer vision camera hooked to pneumatic sorters with 5kW solar PV backup.',
      expectedImpact: '92% waste diverted from municipal landfill, 80 kWh/day clean electricity generated for mandi lighting.',
      estimatedCost: 1850000,
      implementationPlan: '4-week pilot deployment at Gate 3 of Sector 26 Market with municipal sanitation workers.',
      sustainabilityPlan: 'Mandi Board revenues from bio-fertilizer sales fund continuous replacement filters.',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 2 * 86400000),
    },
  })

  // 5. STAGE 7: INDUSTRY_COLLABORATION (Air Quality Telemetry & Scrubbing)
  const airProblem = await prisma.problem.upsert({
    where: { referenceId: 'PRB-2026-00005' },
    update: {},
    create: {
      referenceId: 'PRB-2026-00005',
      citizenId: citizen.id,
      title: 'Air Quality Telemetry & Low-Cost Particulate Matter Scrubbing System',
      description: 'Heavy diesel transport and metal fabrication workshops generate PM2.5 and PM10 levels exceeding 380 ug/m3 in industrial areas, affecting worker health and nearby settlements.',
      category: 'ENVIRONMENT',
      location: 'Industrial Area Phase 1 & 2',
      municipality: 'Municipal Corporation of Chandigarh',
      district: 'Chandigarh',
      state: 'Punjab',
      affectedPopulation: 25000,
      status: 'INDUSTRY_COLLABORATION',
      isEmergency: false,
      aiCategory: 'ENVIRONMENT',
      aiSeverity: 'HIGH',
      createdAt: new Date(Date.now() - 30 * 86400000),
    },
  })

  const airProject = await prisma.universityProject.upsert({
    where: { problemId: airProblem.id },
    update: {},
    create: {
      problemId: airProblem.id,
      universityId: university.id,
      title: 'Industrial Micro-Scrubber & Hyperlocal Air Sensor Network',
      description: 'Dense sensor deployment and industrial localized particulate matter absorption.',
      status: 'INDUSTRY_COLLABORATION',
    },
  })

  const industryCollab = await prisma.industryCollaboration.upsert({
    where: { id: 'demo-collab-01' },
    update: {},
    create: {
      id: 'demo-collab-01',
      projectId: airProject.id,
      industryPartnerId: industry.id,
      collaborationType: 'FUNDING',
      description: 'CSR sponsorship of 25 sensor units and technical integration with SmartCity cloud telemetry.',
      status: 'ACTIVE',
      confirmedAt: new Date(Date.now() - 5 * 86400000),
      funding: {
        create: {
          amountRequested: 500000,
          amountCommitted: 500000,
          amountReceived: 250000,
          purpose: 'Sensor procurement and outdoor solar housing fabrication',
          currency: 'INR',
        },
      },
    },
  })

  // 6. STAGE 8: SUSTAINABLE_IMPACT (Community Rainwater Aquifer Recharge)
  const impactProblem = await prisma.problem.upsert({
    where: { referenceId: 'PRB-2026-00006' },
    update: {},
    create: {
      referenceId: 'PRB-2026-00006',
      citizenId: citizen.id,
      title: 'Deep Aquifer Recharging and Community Borewell Restoration',
      description: 'Groundwater table dropped by 18 meters over a decade due to over-extraction. Community borewells had dried up causing acute summer water rationing in Sector 23.',
      category: 'WATER_SUPPLY',
      location: 'Sector 23 Community Park & Surrounding Blocks',
      municipality: 'Municipal Corporation of Chandigarh',
      district: 'Chandigarh',
      state: 'Punjab',
      affectedPopulation: 14200,
      status: 'SUSTAINABLE_IMPACT',
      isEmergency: false,
      aiCategory: 'WATER_SUPPLY',
      aiSeverity: 'MEDIUM',
      createdAt: new Date(Date.now() - 90 * 86400000),
    },
  })

  const impactProject = await prisma.universityProject.upsert({
    where: { problemId: impactProblem.id },
    update: {},
    create: {
      problemId: impactProblem.id,
      universityId: university.id,
      title: 'Smart Managed Aquifer Recharge (MAR) System',
      description: 'Engineered injection wells capturing urban runoff to replenish depleted groundwater.',
      status: 'COMPLETED',
    },
  })

  // Impact Metrics
  const metrics = [
    { metric: 'Groundwater Table Rise', value: 3.4, unit: 'meters', description: 'Measured rise in static water level across 4 test borewells.' },
    { metric: 'Citizens Benefited', value: 14200, unit: 'persons', description: 'Residents receiving continuous daily clean potable water.' },
    { metric: 'Runoff Diverted to Aquifer', value: 1850000, unit: 'liters/monsoon', description: 'Monsoon rainwater saved from storm drain runoff.' },
    { metric: 'Water Quality Score', value: 96, unit: '%', description: 'TDS and potability rating compliance certified by State Water Board.' },
  ]

  for (const m of metrics) {
    await prisma.impactMetric.create({
      data: {
        projectId: impactProject.id,
        metric: m.metric,
        value: m.value,
        unit: m.unit,
        description: m.description,
        measuredAt: new Date(Date.now() - 10 * 86400000),
      },
    })
  }

  // ─── COMMUNITY CONFIRMATIONS (+1 Endorsements) ───────────────────────────
  await prisma.communityConfirmation.upsert({
    where: { problemId_citizenId: { problemId: emergencyProblem.id, citizenId: citizen.id } },
    update: {},
    create: {
      problemId: emergencyProblem.id,
      citizenId: citizen.id,
      comment: 'Confirmed! Hospital road is completely waterlogged with exposed sparking wires. High emergency.',
    },
  })

  // ─── ROLE-BASED NOTIFICATIONS ───────────────────────────────────────────
  const notificationsData = [
    {
      userId: citizen.id,
      title: 'Project Update: PRB-2026-00001',
      message: 'Your reported drainage problem near Sector 12 school is now in active Solution Development with PEC engineering team.',
      type: 'INFO',
      link: '/problems/PRB-2026-00001',
    },
    {
      userId: govt.id,
      title: '🚨 CRITICAL EMERGENCY INCIDENT',
      message: 'URGENT: High-voltage 11kV live line snapped into flooded street near Hospital in Sector 15. Verified by AI emergency engine.',
      type: 'ALERT',
      link: `/problems/${emergencyProblem.id}`,
    },
    {
      userId: govt.id,
      title: 'Solution Validation Awaiting Review',
      message: 'Punjab Engineering College has submitted solution proposal for "Solid Waste Segregation Unit". Rubric evaluation ready.',
      type: 'ACTION',
      link: `/problems/${wasteProblem.id}`,
    },
    {
      userId: university.id,
      title: 'New Verified Problem for University Adoption',
      message: 'Problem PRB-2026-00003 (Canal Footbridge Structural Scour) has been verified and allocated for PEC faculty adoption.',
      type: 'ACTION',
      link: `/problems/${bridgeProblem.id}`,
    },
    {
      userId: faculty.id,
      title: 'Faculty Mentorship Assigned',
      message: 'You have been assigned as lead faculty advisor for Project FloodGuard (Smart Drainage Management).',
      type: 'INFO',
      link: '/faculty/projects',
    },
    {
      userId: industry.id,
      title: 'CSR Collaboration Milestone Approved',
      message: 'Municipal Corporation approved phase 1 deployment for Industrial Air Scrubber telemetry project.',
      type: 'SUCCESS',
      link: '/industry/collaborations',
    },
    {
      userId: admin.id,
      title: 'Platform System Audit Report Ready',
      message: 'SIH 26043 prototype audit trail generated: 7 active problem lifecycles, 1 acute emergency incident tracked.',
      type: 'INFO',
      link: '/admin/audit',
    },
  ]

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n })
  }

  console.log('✅ Comprehensive demo data created:')
  console.log('   - 1 Critical Emergency Problem (PRB-2026-EMG-01, Topmost priority)')
  console.log('   - 6 Multi-stage civic problems covering full 8-step lifecycle')
  console.log('   - Solutions, Rubric Validations, Industry CSR funding records, Impact metrics')
  console.log('   - Notifications populated for all 6 demo user roles')
  console.log('')
  console.log('🎉 Database seeded successfully for SIH 26043 Prototype!')
  console.log('')
  console.log('Demo accounts (Password: demo1234):')
  console.log('  Citizen:     citizen@demo.sih')
  console.log('  Government:  govt@demo.sih')
  console.log('  University:  university@demo.sih')
  console.log('  Faculty:     faculty@demo.sih')
  console.log('  Industry:    industry@demo.sih')
  console.log('  Admin:       admin@demo.sih')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

