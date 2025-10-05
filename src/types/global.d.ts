declare interface ElectronAPI {
  dbGetAllUsers?: () => Promise<any>;
  dbGetUserByUsername?: (username: string) => Promise<any>;
  dbCreateUser?: (username: string, password: string, role?: string) => Promise<any>;
  dbVerifyPassword?: (username: string, password: string) => Promise<any>;
  dbResetPassword?: (username: string, newPassword: string) => Promise<any>;
  dbDeleteUser?: (userId: number) => Promise<any>;
  dbGetUserCollections?: (userId: number) => Promise<any>;
  dbCreateCollection?: (name: string, description: string, ownerId: number) => Promise<any>;
  dbUpdateCollection?: (id: number, updates: any) => Promise<any>;
  dbDeleteCollection?: (id: number) => Promise<any>;
  dbCreateTeam?: (name: string, description: string, ownerId: number) => Promise<any>;
  dbGetUserTeams?: (userId: number) => Promise<any>;
  dbGetTeamById?: (teamId: number) => Promise<any>;
  dbUpdateTeam?: (id: number, updates: any) => Promise<any>;
  dbDeleteTeam?: (id: number) => Promise<any>;
  dbAddTeamMember?: (teamId: number, userId: number, role?: string) => Promise<any>;
  dbRemoveTeamMember?: (teamId: number, userId: number) => Promise<any>;
  dbUpdateTeamMemberRole?: (teamId: number, userId: number, role: string) => Promise<any>;
  dbGetTeamCollections?: (teamId: number) => Promise<any>;
  dbAssignCollectionToTeam?: (collectionId: number, teamId: number) => Promise<any>;
  dbRemoveCollectionFromTeam?: (collectionId: number) => Promise<any>;
  dbGetCollectionRequests?: (collectionId: number) => Promise<any>;
  dbCreateRequest?: (request: any) => Promise<any>;
  dbUpdateRequest?: (id: number, request: any) => Promise<any>;
  dbDeleteRequest?: (id: number) => Promise<any>;
  dbSaveTestResult?: (result: any) => Promise<any>;
  dbGetTestResults?: (requestId: number, limit?: number) => Promise<any>;
  dbSaveTestSuite?: (testSuite: any) => Promise<any>;
  dbGetTestSuites?: (requestId: number) => Promise<any>;
  dbUpdateTestSuite?: (id: number, updates: any) => Promise<any>;
  dbDeleteTestSuite?: (id: number) => Promise<any>;
  dbCreateProject?: (project: any) => Promise<any>;
  dbGetUserProjects?: (userId: number) => Promise<any>;
  dbUpdateProject?: (id: number, updates: any) => Promise<any>;
  dbDeleteProject?: (id: number) => Promise<any>;
  dbGetProjectCollections?: (projectId: number) => Promise<any>;
}

declare global {
  interface Window { electronAPI: ElectronAPI; }
}

export {};
