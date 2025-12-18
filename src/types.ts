
export type RequestStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Pending Team Lead' | 'Pending Finance' | 'Pending CFO';

export interface ProcurementRequest {
  id: string;
  type: 'Direct' | 'Other' | 'Invoice' | 'Direct Invoice' | 'Other Invoice' | 'Direct Procurement' | 'Other Procurement';
  applicant: string;
  team: string;
  vendor: string;
  amount: number;
  date: string;
  status: RequestStatus;
  priority?: 'Low' | 'Normal' | 'High';
}
