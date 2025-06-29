import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Claim {
  id: string;
  type: string;
  statement: string;
  paragraph: string;
  date: string;
  confidence: number;
}

interface Evidence {
  id: string;
  name: string;
  type: string;
  claimId: string;
  rating: 'Good' | 'Moderate' | 'Bad';
  issues: string;
  metadata: {
    relevance: number;
    clarity: number;
    completeness: number;
    specificity: number;
    timeliness: number;
    credibility: number;
    metadata: number;
    contextMatch: number;
  };
}

interface PetitionState {
  petitionFile: File | null;
  petitionContent: string;
  claims: Claim[];
  evidence: Evidence[];
  reportData: {
    caseNumber: string;
    petitionerName: string;
    accused: string;
    policeStation: string;
    shoName: string;
    incidentDates: string[];
    petitionDate: string;
  };
  currentStep: number;
}

type PetitionAction =
  | { type: 'SET_PETITION_FILE'; payload: File }
  | { type: 'SET_PETITION_CONTENT'; payload: string }
  | { type: 'SET_CLAIMS'; payload: Claim[] }
  | { type: 'ADD_EVIDENCE'; payload: Evidence }
  | { type: 'UPDATE_EVIDENCE'; payload: { id: string; evidence: Partial<Evidence> } }
  | { type: 'SET_REPORT_DATA'; payload: Partial<PetitionState['reportData']> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'RESET_STATE' };

const initialState: PetitionState = {
  petitionFile: null,
  petitionContent: '',
  claims: [],
  evidence: [],
  reportData: {
    caseNumber: '',
    petitionerName: '',
    accused: '',
    policeStation: '',
    shoName: '',
    incidentDates: [],
    petitionDate: '',
  },
  currentStep: 0,
};

const petitionReducer = (state: PetitionState, action: PetitionAction): PetitionState => {
  switch (action.type) {
    case 'SET_PETITION_FILE':
      return { ...state, petitionFile: action.payload };
    case 'SET_PETITION_CONTENT':
      return { ...state, petitionContent: action.payload };
    case 'SET_CLAIMS':
      return { ...state, claims: action.payload };
    case 'ADD_EVIDENCE':
      return { ...state, evidence: [...state.evidence, action.payload] };
    case 'UPDATE_EVIDENCE':
      return {
        ...state,
        evidence: state.evidence.map(e =>
          e.id === action.payload.id ? { ...e, ...action.payload.evidence } : e
        ),
      };
    case 'SET_REPORT_DATA':
      return { ...state, reportData: { ...state.reportData, ...action.payload } };
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};

const PetitionContext = createContext<{
  state: PetitionState;
  dispatch: React.Dispatch<PetitionAction>;
} | null>(null);

export const PetitionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(petitionReducer, initialState);

  return (
    <PetitionContext.Provider value={{ state, dispatch }}>
      {children}
    </PetitionContext.Provider>
  );
};

export const usePetition = () => {
  const context = useContext(PetitionContext);
  if (!context) {
    throw new Error('usePetition must be used within a PetitionProvider');
  }
  return context;
};