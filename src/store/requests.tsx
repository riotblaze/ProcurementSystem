
import React, { createContext, useContext, useReducer } from 'react';
import { ProcurementRequest, RequestStatus } from '../types';

type State = {
  requests: ProcurementRequest[];
};

type Action =
  | { type: 'CREATE_REQUEST'; payload: ProcurementRequest }
  | { type: 'UPDATE_STATUS'; id: string; status: RequestStatus };

const initialState: State = {
  requests: [
    { id: 'PR-2024-001', type: 'Direct', applicant: 'John Smith', team: 'Marketing', vendor: 'Office Supplies Co.', amount: 1250.00, date: '2024-07-20', status: 'Approved', priority: 'Normal' },
    { id: 'PR-2024-002', type: 'Direct', applicant: 'John Smith', team: 'Marketing', vendor: 'Global Tech', amount: 3000.00, date: '2024-07-22', status: 'Pending Team Lead', priority: 'Normal' },
    { id: 'PR-2024-006', type: 'Other', applicant: 'Jane Doe', team: 'IT', vendor: 'AWS Services', amount: 55000.00, date: '2024-07-21', status: 'Pending CFO', priority: 'High' },
    { id: 'PR-2024-007', type: 'Direct', applicant: 'Bob Lee', team: 'Sales', vendor: 'Print Master', amount: 1200.00, date: '2024-07-23', status: 'Pending Finance', priority: 'Normal' },
    { id: 'INV-2024-002', type: 'Direct Invoice', applicant: 'Jane Doe', team: 'Finance', vendor: 'Creative Solutions', amount: 850.50, date: '2024-07-20', status: 'Pending Approval', priority: 'Normal' },
    { id: 'INV-2024-005', type: 'Other Invoice', applicant: 'Mike Finance', team: 'Finance', vendor: 'Office Supplies Co.', amount: 200.00, date: '2024-07-24', status: 'Pending Approval', priority: 'Low' },
    { id: 'PR-2024-003', type: 'Direct', applicant: 'Emily White', team: 'HR', vendor: 'Office Supplies Co.', amount: 300.00, date: '2024-07-19', status: 'Rejected', priority: 'Low' },
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, requests: [action.payload, ...state.requests] };
    case 'UPDATE_STATUS':
      return {
        ...state,
        requests: state.requests.map(r =>
          r.id === action.id ? { ...r, status: action.status } : r
        ),
      };
    default:
      return state;
  }
}

const RequestsContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

export const RequestsProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <RequestsContext.Provider value={{ state, dispatch }}>{children}</RequestsContext.Provider>;
};

export const useRequests = () => {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider');
  return ctx;
};
