export class CreateMatchDto {
    readonly teamId: string; // El id del equipo seleccionado por el usuario
    readonly userId: string; // El id del usuario
    readonly opponentTeamId: string;
  }