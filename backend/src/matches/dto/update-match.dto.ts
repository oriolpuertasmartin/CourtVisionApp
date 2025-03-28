export class UpdateMatchDto {
  readonly opponentTeam?: {
    name: string;
    category: string;
    photo: string;
  };

  readonly startingPlayers?: string[]; // IDs de los jugadores titulares
}