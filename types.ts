
export interface RestorationItem {
  id: string;
  originalUrl: string;
  restoredUrl: string;
  timestamp: number;
}

export enum AppState {
  LANDING = 'LANDING',
  RESTORING = 'RESTORING',
  RESULT = 'RESULT',
  DASHBOARD = 'DASHBOARD'
}

export interface User {
  email: string;
  isSubscribed: boolean;
}
