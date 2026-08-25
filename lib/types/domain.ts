export type UserRole =
  | 'admin'
  | 'client'
  | 'design'
  | 'designer'
  | 'operations'
  | 'warehouse'
  | 'cutting'
  | 'cnc'
  | 'edge_banding'
  | 'qc'
  | 'finance';

export type OrderStatus =
  | 'draft'
  | 'in_progress'
  | 'ready_for_production'
  | 'in_production'
  | 'completed'
  | 'cancelled'
  | 'pending'
  | 'design'
  | 'production'
  | 'warehouse'
  | 'delivery';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  phone?: string;
  telegramChatId?: string;
  createdAt: string;
  isActive: boolean;
}

export interface RegistrationCode {
  id: string;
  code: string;
  role: UserRole;
  status?: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
  usedBy?: string;
}

export interface OrderItem {
  id: string;
  productId?: string;
  productName: string;
  itemType?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  clientName: string;
  client?: {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
  };
  status: OrderStatus;
  createdAt: string;
  totalAmount: number;
  assignedDesigner?: string;
  handledByDesignerId?: string;
  items: OrderItem[];
}

export interface CuttingList {
  id: string;
  orderId: string;
  createdBy: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'declined';
  declineReason?: string;
}

export interface BillOfMaterials {
  id: string;
  orderId: string;
  status: 'pending' | 'approved' | 'declined';
  boards: Record<string, number>;
  colors: Record<string, number>;
  accessories: Record<string, number>;
  edging: Record<string, number>;
  warehouseApproved: boolean;
}

export interface ProductionSchedule {
  id: string;
  orderId: string;
  startDate: string;
  endDate: string;
  deliveryDate?: string;
  productionStart?: string;
  productionEnd?: string;
  coordinatorId?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | string;
}

export interface Notification {
  id: string;
  userId: string;
  orderId?: string;
  type: 'order_update' | 'cutting_list' | 'bom' | 'delivery' | 'system' | string;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'order' | 'cutting_list' | 'bom' | 'user' | 'client' | 'product' | string;
  entityId: string;
  entityName?: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  assignedDesigner?: string;
  createdAt: string;
  orders?: Order[];
}

export interface PriceOffer {
  id: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'approved' | 'revision_requested' | string;
  createdAt: string;
  sentBy: string;
}

export interface ProcurementRequest {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  requestedBy?: string;
  createdAt: string;
}

export interface MaterialTransaction {
  id: string;
  materialId: string;
  materialName?: string;
  type: 'in' | 'out' | 'acquisition' | 'withdrawal' | string;
  quantity: number;
  timestamp: string;
  performedBy?: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  senderName?: string;
  content: string;
  channel?: 'telegram' | 'web' | string;
  type?: 'text' | 'image' | 'document' | string;
  createdAt: string;
}

export interface Design {
  id: string;
  orderId: string;
  version: number;
  fileUrl: string;
  status: 'drafting' | 'submitted' | 'approved' | 'revision_requested' | string;
  createdAt: string;
  comments?: string;
}
