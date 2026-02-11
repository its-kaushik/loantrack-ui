export interface ImposePenaltyParams {
  loanId: string;
  overrideAmount?: number;
  notes?: string;
}

export interface WaivePenaltyParams {
  penaltyId: string;
  waiveAmount: number;
  notes?: string;
}

export interface WaiveInterestParams {
  loanId: string;
  waiveAmount: number;
  notes?: string;
}
