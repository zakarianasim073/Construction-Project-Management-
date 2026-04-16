
export enum Unit {
  SQM = 'SQM',
  CUM = 'CUM',
  KG = 'KG',
  NOS = 'NOS',
  RMT = 'RMT',
  CFT = 'CFT',
  BAG = 'BAG',
  TON = 'TON'
}

export type UserRole = 'DIRECTOR' | 'MANAGER' | 'ACCOUNTANT' | 'ENGINEER';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  uid?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email?: string;
}

export interface ProjectMember {
  uid: string;
  name: string;
  role: UserRole;
  avatar?: string;
  joinedAt: string;
}

export interface CostBreakdown {
  material: number;
  labor: number;
  equipment: number;
  overhead: number;
}

export interface CostAnalysis {
  unitCost: number; // Actual cost per unit
  breakdown: CostBreakdown;
}

export interface BOQItem {
  id: string;
  description: string;
  unit: Unit;
  rate: number; // Contract Selling Rate
  plannedQty: number;
  plannedUnitCost: number; // Internal Budgeted Cost
  plannedBreakdown?: CostBreakdown; // Detailed planned breakdown
  executedQty: number; // From Site Execution
  billedAmount?: number; // Cumulative amount certified/received from PE
  costAnalysis?: CostAnalysis;
  priority?: Priority;
  linkedDocId?: string; // Reference to a specific ProjectDocument
}

export interface MaterialConsumption {
  materialId: string;
  qty: number;
}

export interface SubContractor {
  id: string;
  name: string;
  specialization: string;
  contactNumber?: string;
  agreedRates: { boqId: string; rate: number }[]; // Rate per unit for specific BOQ items
  totalWorkValue: number; // Value of work done based on DPRs
  totalBilled: number; // Amount billed/paid via Bills
  currentLiability: number; // totalWorkValue - totalBilled
  pdRemarks?: string;
}

export interface DPR {
  id: string;
  date: string;
  activity: string;
  location: string;
  laborCount: number;
  remarks: string;
  linkedBoqId?: string; // Optional link to BOQ
  subContractorId?: string; // Link to Sub-Contractor if they did the work
  workDoneQty?: number; // Quantity achieved today
  materialsUsed?: MaterialConsumption[]; // Materials consumed in this activity
  pdRemarks?: string; // Project Director Note
}

export interface Material {
  id: string;
  name: string;
  unit: Unit;
  totalReceived: number; // Cumulative Sent to Site
  totalConsumed: number; // Cumulative Used
  currentStock: number; // Calculated Stock
  averageRate: number; // Buying Price per unit
  pdRemarks?: string; // Project Director Note
}

export interface Bill {
  id: string;
  type: 'CLIENT_RA' | 'VENDOR_INVOICE' | 'SUB_CONTRACTOR' | 'MATERIAL_EXPENSE';
  entityName: string; // Client or Vendor Name
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING';
  pdRemarks?: string;
  category?: 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'OVERHEAD' | 'OTHER';
}

export interface Liability {
  id: string;
  description: string;
  type: 'RETENTION' | 'PENDING_PO' | 'UNBILLED_WORK';
  amount: number;
  dueDate: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'AT_RISK';
  description?: string;
}

export type DocumentCategory = 'CONTRACT' | 'DRAWING' | 'PERMIT' | 'REPORT' | 'BILL' | 'OTHER';
export type ModuleType = 'MASTER' | 'SITE' | 'FINANCE' | 'LIABILITY' | 'GENERAL';

export interface ProjectDocument {
  id: string;
  name: string;
  type: string; // e.g., 'PDF', 'JPG', 'XLSX'
  category: DocumentCategory;
  module: ModuleType;
  uploadDate: string;
  size: string;
  url?: string;
  content?: string; // Base64 encoded content
  isAnalyzed?: boolean;
  tags?: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: Priority;
  assignedTo?: string; // User UID
  dueDate: string;
  startDate?: string; // For Gantt
  dependencies?: string[]; // Task IDs
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  materialId: string;
  vendorName: string;
  qty: number;
  rate: number;
  totalAmount: number;
  status: 'DRAFT' | 'SENT' | 'DELIVERED' | 'CANCELLED';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
}

export interface QualityCheck {
  id: string;
  title: string;
  location: string;
  inspectorUid: string;
  date: string;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  items: {
    description: string;
    isOk: boolean;
    remarks?: string;
  }[];
  photos?: string[]; // URLs/Base64
}

export interface SafetyCheck {
  id: string;
  date: string;
  inspectorUid: string;
  score: number; // 0-100
  hazardsIdentified: string[];
  correctiveActions: string[];
  status: 'SAFE' | 'ACTION_REQUIRED' | 'CRITICAL';
}

export interface PhotoLog {
  id: string;
  url: string;
  caption: string;
  location: string;
  activityId?: string; // Link to DPR activity
  uploadedBy: string;
  createdAt: string;
  tags: string[];
}

export interface Comment {
  id: string;
  targetId: string; // ID of the document or task
  targetType: 'DOCUMENT' | 'TASK';
  authorUid: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientUid: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'DOC_UPLOADED' | 'TASK_COMPLETED' | 'COMMENT_ADDED';
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AiSuggestion {
  id: string;
  docId: string;
  type: 'QUANTITY_UPDATE' | 'BILL_DETECTION' | 'RISK_ALERT' | 'BOQ_IMPORT' | 'DPR_ENTRY';
  title: string;
  description: string;
  value?: any; // Quantity number or Bill object or BOQItem[] or ExtractedDPR
  linkedId?: string; // BOQ Item ID or similar
  status: 'PENDING' | 'APPLIED' | 'DISMISSED';
}

export interface ProjectState {
  id: string;
  name: string;
  ownerUid: string;
  memberUids: string[]; // For querying projects a user belongs to
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  priority: Priority;
  contractValue: number;
  startDate: string;
  endDate: string;
  boq: BOQItem[];
  materials: Material[]; // New Material Inventory
  subContractors: SubContractor[]; // New Sub-Contractor Management
  dprs: DPR[];
  bills: Bill[];
  liabilities: Liability[];
  milestones: Milestone[];
  documents: ProjectDocument[];
  aiSuggestions: AiSuggestion[];
  // New features data
  purchaseOrders?: PurchaseOrder[];
  qualityChecks?: QualityCheck[];
  safetyChecks?: SafetyCheck[];
  photoLogs?: PhotoLog[];
  equipment?: Equipment[];
  attendance?: AttendanceRecord[];
  changeOrders?: ChangeOrder[];
  vendors?: Vendor[];
  riskAssessment?: RiskAssessment;
  weatherForecast?: WeatherForecast[];
  sustainabilityMetrics?: SustainabilityMetrics;
  bimModels?: BimModel[];
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OUT_OF_ORDER';
  lastMaintenance: string;
  nextMaintenance: string;
  assignedOperator?: string;
  fuelConsumptionRate?: number; // Liters per hour
  hourlyRate: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  workerName: string;
  category: 'SKILLED' | 'UNSKILLED' | 'SUPERVISOR';
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE';
}

export interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  requestedBy: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  estimatedCost: number;
  approvedCost?: number;
  date: string;
  linkedBoqId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number; // 1-5
  totalOrders: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
}

export interface RiskAssessment {
  lastUpdated: string;
  overallRiskScore: number; // 0-100
  risks: {
    category: string;
    description: string;
    impact: 'LOW' | 'MEDIUM' | 'HIGH';
    probability: number; // 0-1
    mitigation: string;
  }[];
}

export interface WeatherForecast {
  date: string;
  temp: number;
  condition: string;
  precipitationProbability: number;
  impactOnSite: 'NONE' | 'CAUTION' | 'STOP_WORK';
}

export interface SustainabilityMetrics {
  carbonFootprint: number; // kg CO2
  wasteGenerated: {
    type: string;
    qty: number;
    unit: Unit;
    recycledQty: number;
  }[];
  waterUsage: number; // Liters
}

export interface BimModel {
  id: string;
  name: string;
  url: string;
  version: string;
  uploadedAt: string;
}

export interface ExtractedMaterial {
  name: string;
  qty: number;
}

export interface ExtractedDPR {
  date?: string;
  activity?: string;
  location?: string;
  laborCount?: number;
  remarks?: string;
  workDoneQty?: number;
  linkedBoqId?: string;
  subContractorName?: string; 
  materials?: ExtractedMaterial[]; // Structured extracted materials
}

export interface ExtractedBill {
  entityName?: string;
  amount?: number;
  date?: string;
  type?: 'CLIENT_RA' | 'VENDOR_INVOICE';
}
