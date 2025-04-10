export class UpdateMatchDto {
    readonly status?: string; // Para marcar el partido como "completed"
    
    readonly opponentTeam?: {
      name: string;
      category: string;
      photo: string;
    };
  
    readonly startingPlayers?: string[]; // IDs de los jugadores titulares
    
    readonly teamAScore?: number;
    readonly teamBScore?: number;
    readonly teamAFouls?: number;
    readonly teamBFouls?: number;
    readonly currentPeriod?: string;
    
    readonly periodsHistory?: {
      period: string;
      teamAScore: number;
      teamBScore: number;
      teamAFouls: number;
      teamBFouls: number;
    }[];
}