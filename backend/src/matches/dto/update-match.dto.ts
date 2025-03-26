export class UpdateMatchDto {
    readonly opponentTeam?: {
      name: string;
      category: string;
      photo: string;
    };
  }