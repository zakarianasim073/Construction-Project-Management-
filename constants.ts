
import { ProjectState, Unit } from './types';

export const MOCK_PROJECTS: ProjectState[] = [
  {
    id: 'P001',
    name: "Bank Protective Work at Munshirhat, Gaibandha (BWDB)",
    ownerUid: 'system',
    memberUids: ['system'],
    status: 'ACTIVE',
    priority: 'HIGH',
    contractValue: 181592188,
    startDate: "2023-09-25",
    endDate: "2026-03-28",
    materials: [
      { id: 'MAT-01', name: 'Portland Composite Cement', unit: Unit.BAG, totalReceived: 5000, totalConsumed: 4200, currentStock: 800, averageRate: 540, pdRemarks: 'Ensure Holcim brand for casting' },
      { id: 'MAT-02', name: 'Sylhet Sand (FM 2.5)', unit: Unit.CFT, totalReceived: 20000, totalConsumed: 15000, currentStock: 5000, averageRate: 45 },
      { id: 'MAT-03', name: 'Stone Chips (3/4")', unit: Unit.CFT, totalReceived: 35000, totalConsumed: 28000, currentStock: 7000, averageRate: 185 },
      { id: 'MAT-04', name: 'Geo-Textile Bags', unit: Unit.NOS, totalReceived: 50000, totalConsumed: 20404, currentStock: 29596, averageRate: 28 }
    ],
    subContractors: [
      { 
        id: 'SC-01', 
        name: 'Sweet Chairman', 
        specialization: 'Earth Work & Geo-Bag', 
        totalWorkValue: 450000, 
        totalBilled: 155762, 
        currentLiability: 294238, 
        agreedRates: [
          { boqId: '40-370-20', rate: 45.00 }, // Dumping Geo-bag labor rate
          { boqId: '40-920', rate: 30.00 } // Earth work labor rate
        ],
        pdRemarks: 'Hold 10% retention from next bill.'
      },
      { 
        id: 'SC-02', 
        name: 'M/S Rahman Enterprise', 
        specialization: 'CC Block Casting', 
        totalWorkValue: 1200000, 
        totalBilled: 1000000, 
        currentLiability: 200000, 
        agreedRates: [
          { boqId: '40-190-35', rate: 65.00 }, // Block casting labor rate
        ]
      }
    ],
    boq: [
      { 
        id: '40-920', 
        description: 'Earth work in cutting and filling of eroded bank', 
        unit: Unit.CUM, 
        rate: 123.59, 
        plannedUnitCost: 105.00,
        plannedBreakdown: { material: 50, labor: 30, equipment: 20, overhead: 5 },
        plannedQty: 27977, 
        executedQty: 27977,
        billedAmount: 3000000, // Partial billing
        priority: 'MEDIUM',
        costAnalysis: {
          unitCost: 115.00,
          breakdown: { material: 80, labor: 25, equipment: 10, overhead: 0 }
        }
      },
      { 
        id: '40-370-20', 
        description: 'Supply, Filling and Dumping of Geo-bag', 
        unit: Unit.NOS, 
        rate: 295.00, 
        plannedUnitCost: 250.00,
        plannedBreakdown: { material: 200, labor: 30, equipment: 15, overhead: 5 },
        plannedQty: 20404, 
        executedQty: 20404,
        billedAmount: 6019180, // Fully billed
        priority: 'HIGH',
        costAnalysis: {
          unitCost: 280.00,
          breakdown: { material: 220, labor: 40, equipment: 10, overhead: 10 }
        }
      },
      { 
        id: '40-190-35', 
        description: 'CC blocks(1:2.5:5): 40cm x 40cm x 40cm', 
        unit: Unit.NOS, 
        rate: 852.00, 
        plannedUnitCost: 800.00,
        plannedBreakdown: { material: 550, labor: 150, equipment: 70, overhead: 30 },
        plannedQty: 47000, 
        executedQty: 18896,
        billedAmount: 12000000,
        priority: 'HIGH',
        costAnalysis: {
          unitCost: 910.00,
          breakdown: { material: 600, labor: 200, equipment: 80, overhead: 30 }
        }
      },
      { 
        id: '40-190-50', 
        description: 'CC blocks(1:2.5:5): 30cm x 30cm x 30cm', 
        unit: Unit.NOS, 
        rate: 362.00, 
        plannedUnitCost: 310.00,
        plannedBreakdown: { material: 180, labor: 100, equipment: 20, overhead: 10 },
        plannedQty: 70370, 
        executedQty: 32049,
        billedAmount: 11000000,
        priority: 'MEDIUM',
        costAnalysis: {
          unitCost: 330.00, 
          breakdown: { material: 200, labor: 100, equipment: 20, overhead: 10 }
        }
      },
      { 
        id: '40-190-40', 
        description: 'CC blocks(1:2.5:5): 40cm x 40cm x 20cm', 
        unit: Unit.NOS, 
        rate: 432.00, 
        plannedUnitCost: 380.00,
        plannedBreakdown: { material: 250, labor: 100, equipment: 20, overhead: 10 },
        plannedQty: 118260, 
        executedQty: 15344,
        billedAmount: 0,
        priority: 'LOW',
        costAnalysis: {
          unitCost: 400.00,
          breakdown: { material: 280, labor: 100, equipment: 10, overhead: 10 }
        }
      },
      { 
        id: '40-290-10', 
        description: 'Dumping of stone/boulders/blocks by boat: Within 200m', 
        unit: Unit.CUM, 
        rate: 1638.00, 
        plannedUnitCost: 1450.00,
        plannedBreakdown: { material: 1100, labor: 250, equipment: 100, overhead: 0 },
        plannedQty: 3926.39, 
        executedQty: 981.60,
        billedAmount: 0,
        priority: 'MEDIUM',
        costAnalysis: {
          unitCost: 1400.00,
          breakdown: { material: 1000, labor: 300, equipment: 100, overhead: 0 }
        }
      },
      { 
        id: '40-500-40', 
        description: 'Supply and laying geotex filter', 
        unit: Unit.SQM, 
        rate: 202.00, 
        plannedUnitCost: 175.00,
        plannedBreakdown: { material: 140, labor: 35, equipment: 0, overhead: 0 },
        plannedQty: 24187.50, 
        executedQty: 12500,
        billedAmount: 2000000,
        priority: 'LOW',
        costAnalysis: {
          unitCost: 180.00,
          breakdown: { material: 150, labor: 30, equipment: 0, overhead: 0 }
        }
      },
    ],
    dprs: [
      { id: '105', date: '2024-11-19', activity: 'CC Block Manufacturing (Package-Munshirhat 01)', location: 'Casting Yard', laborCount: 30, remarks: 'Produced 97 nos 50x50x50 and 246 nos 40x40x40 blocks.', linkedBoqId: '40-190-35', subContractorId: 'SC-02', workDoneQty: 97, materialsUsed: [{ materialId: 'MAT-01', qty: 138 }, { materialId: 'MAT-02', qty: 250 }] },
      { id: '106', date: '2024-11-19', activity: 'Geo-Bag Dumping by Boat', location: 'River Bank', laborCount: 19, remarks: 'Cumulative dumping progress 46.87%', linkedBoqId: '40-370-20', subContractorId: 'SC-01', workDoneQty: 150 },
      { id: '107', date: '2024-12-30', activity: 'Monthly Reconciliation', location: 'Site Office', laborCount: 4, remarks: 'Gaibandha Munshirhat Block Casting Work Done Vol: 103385 cft' },
    ],
    bills: [
      { id: 'RA-08', type: 'CLIENT_RA', entityName: 'BWDB Gaibandha O&M Division', amount: 12500000, date: '2024-10-15', status: 'PAID' },
      { id: 'RA-09', type: 'CLIENT_RA', entityName: 'BWDB Gaibandha O&M Division', amount: 8599950, date: '2025-04-07', status: 'PENDING' },
      { id: 'SUP-01', type: 'MATERIAL_EXPENSE', entityName: 'Hassan & Brothers Ltd (Supplier)', amount: 450000, date: '2024-11-20', status: 'PAID' },
      { id: 'SUP-02', type: 'SUB_CONTRACTOR', entityName: 'Sweet Chairman (Sub-contractor)', amount: 155762, date: '2024-11-19', status: 'PENDING' },
    ],
    liabilities: [
      { id: 'L001', description: 'Security Deposit (Retention 10%)', type: 'RETENTION', amount: 1250000, dueDate: '2026-03-28' },
      { id: 'L002', description: 'Pending PO - Stone Chips (Sylhet)', type: 'PENDING_PO', amount: 867802, dueDate: '2024-12-01' },
      { id: 'L003', description: 'Unbilled Labor (Nov)', type: 'UNBILLED_WORK', amount: 45000, dueDate: '2024-12-05' },
    ],
    milestones: [
      { id: 'M1', title: 'Site Mobilization', date: '2023-10-01', status: 'COMPLETED', description: 'Site office setup and initial equipment deployment' },
      { id: 'M2', title: 'Geo-Bag Dumping Completion', date: '2024-12-30', status: 'COMPLETED', description: 'Primary river bank protection layer' },
      { id: 'M3', title: 'CC Block Casting (50%)', date: '2025-06-01', status: 'AT_RISK', description: 'Target 50% of total block volume cast' },
      { id: 'M4', title: 'Pre-Monsoon Protection', date: '2025-05-15', status: 'PENDING', description: 'Critical protection works before water level rise' }
    ],
    documents: [
      { id: 'D001', name: 'Running Bill RA-09.pdf', type: 'PDF', category: 'BILL', module: 'FINANCE', uploadDate: '2025-04-07', size: '1.4 MB' },
      { id: 'D002', name: 'Daily Progress Report_19.11.25.pdf', type: 'PDF', category: 'REPORT', module: 'SITE', uploadDate: '2024-11-19', size: '2.1 MB' },
      { id: 'D003', name: 'Profit_Loss_Summary_30.12.2024.xlsx', type: 'XLSX', category: 'REPORT', module: 'FINANCE', uploadDate: '2024-12-30', size: '0.5 MB' },
      { id: 'D004', name: 'BOQ_Schedule.pdf', type: 'PDF', category: 'CONTRACT', module: 'MASTER', uploadDate: '2023-09-01', size: '3.8 MB' },
    ],
    aiSuggestions: [],
    purchaseOrders: [
      { id: 'PO-001', materialId: 'MAT-01', vendorName: 'Holcim Cement Ltd.', qty: 2000, rate: 540, totalAmount: 1080000, status: 'DELIVERED', orderDate: '2025-03-10', actualDeliveryDate: '2025-03-15' },
      { id: 'PO-002', materialId: 'MAT-04', vendorName: 'Geo-Tech Solutions', qty: 10000, rate: 28, totalAmount: 280000, status: 'SENT', orderDate: '2025-04-01', expectedDeliveryDate: '2025-04-10' }
    ],
    qualityChecks: [
      { id: 'QC-01', title: 'Concrete Slump Test', location: 'Block A Casting', inspectorUid: 'system', date: '2025-04-05', status: 'PASSED', items: [{ description: 'Slump value within 75-100mm', isOk: true }, { description: 'Correct water-cement ratio', isOk: true }] },
      { id: 'QC-02', title: 'Rebar Inspection', location: 'Section 4 Foundation', inspectorUid: 'system', date: '2025-04-06', status: 'PENDING', items: [{ description: 'Correct spacing as per drawing', isOk: true }, { description: 'Rust-free rebar', isOk: false, remarks: 'Minor rust on top layer' }] }
    ],
    safetyChecks: [
      { id: 'S-01', date: '2025-04-01', inspectorUid: 'system', score: 92, hazardsIdentified: ['Loose scaffolding'], correctiveActions: ['Tightened all joints'], status: 'SAFE' },
      { id: 'S-02', date: '2025-04-06', inspectorUid: 'system', score: 65, hazardsIdentified: ['Missing PPE', 'Open excavation'], correctiveActions: ['Issued warnings', 'Fencing required'], status: 'ACTION_REQUIRED' }
    ],
    photoLogs: [
      { id: 'PH-01', url: 'https://picsum.photos/seed/const1/800/600', caption: 'Foundation pouring at Section A', location: 'Section A', uploadedBy: 'system', createdAt: '2025-04-01T10:00:00Z', tags: ['foundation', 'concrete'] },
      { id: 'PH-02', url: 'https://picsum.photos/seed/const2/800/600', caption: 'Material delivery - Cement', location: 'Main Store', uploadedBy: 'system', createdAt: '2025-04-05T14:30:00Z', tags: ['delivery', 'cement'] }
    ],
    equipment: [
      { id: 'EQ-01', name: 'Excavator CAT 320', type: 'Heavy Machinery', status: 'OPERATIONAL', lastMaintenance: '2025-03-01', nextMaintenance: '2025-06-01', assignedOperator: 'Rahim Uddin', hourlyRate: 2500 },
      { id: 'EQ-02', name: 'Concrete Mixer 10/7', type: 'Mixing Equipment', status: 'MAINTENANCE', lastMaintenance: '2025-04-01', nextMaintenance: '2025-04-10', assignedOperator: 'Karim Mia', hourlyRate: 800 }
    ],
    attendance: [
      { id: 'ATT-01', date: '2025-04-07', workerName: 'Abul Kashem', category: 'SKILLED', checkIn: '08:00', status: 'PRESENT' },
      { id: 'ATT-02', date: '2025-04-07', workerName: 'Sujon Ahmed', category: 'UNSKILLED', checkIn: '08:15', status: 'PRESENT' },
      { id: 'ATT-03', date: '2025-04-07', workerName: 'Mofizul Islam', category: 'UNSKILLED', checkIn: '', status: 'ABSENT' }
    ],
    changeOrders: [
      { id: 'CO-01', title: 'Additional Retaining Wall', description: 'Request for extra 50m retaining wall due to soil instability at Section B.', requestedBy: 'Site Engineer', status: 'PENDING', estimatedCost: 1500000, date: '2025-04-05' }
    ],
    vendors: [
      { id: 'VEN-01', name: 'Holcim Cement Ltd.', category: 'Cement', rating: 4.8, totalOrders: 15, onTimeDeliveryRate: 95, qualityScore: 98 },
      { id: 'VEN-02', name: 'BSRM Steels', category: 'Rebar', rating: 4.5, totalOrders: 8, onTimeDeliveryRate: 90, qualityScore: 96 }
    ],
    riskAssessment: {
      lastUpdated: '2025-04-07',
      overallRiskScore: 42,
      risks: [
        { category: 'Weather', description: 'Upcoming monsoon season may delay river bank protection.', impact: 'HIGH', probability: 0.8, mitigation: 'Accelerate geo-bag dumping and complete primary layer before May 15th.' },
        { category: 'Supply Chain', description: 'Potential shortage of Sylhet sand due to transport strike.', impact: 'MEDIUM', probability: 0.3, mitigation: 'Pre-order and stockpile 5000 CFT additional sand.' }
      ]
    },
    weatherForecast: [
      { date: '2025-04-07', temp: 32, condition: 'Sunny', precipitationProbability: 10, impactOnSite: 'NONE' },
      { date: '2025-04-08', temp: 31, condition: 'Cloudy', precipitationProbability: 20, impactOnSite: 'NONE' },
      { date: '2025-04-09', temp: 28, condition: 'Rainy', precipitationProbability: 80, impactOnSite: 'CAUTION' }
    ],
    sustainabilityMetrics: {
      carbonFootprint: 125400,
      waterUsage: 450000,
      wasteGenerated: [
        { type: 'Concrete Waste', qty: 50, unit: Unit.CUM, recycledQty: 35 },
        { type: 'Steel Scrap', qty: 5, unit: Unit.TON, recycledQty: 5 }
      ]
    },
    bimModels: [
      { id: 'BIM-01', name: 'Main Structure - Architectural', url: '#', version: '2.1', uploadedAt: '2025-03-15' },
      { id: 'BIM-02', name: 'MEP Layout - Section A', url: '#', version: '1.0', uploadedAt: '2025-04-01' }
    ]
  },
  {
    id: 'P002',
    name: "New Construction Project",
    ownerUid: 'system',
    memberUids: ['system'],
    status: 'ACTIVE',
    priority: 'MEDIUM',
    contractValue: 0,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    materials: [],
    subContractors: [],
    boq: [],
    dprs: [],
    bills: [],
    liabilities: [],
    milestones: [],
    documents: [],
    aiSuggestions: []
  }
];
