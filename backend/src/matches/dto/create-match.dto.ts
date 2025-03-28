export class CreateMatchDto {
  readonly teamId: string; // El id del equipo seleccionado por el usuario
  readonly userId: string; // El id del usuario
  readonly opponentTeamId?: string; // Opcional, ya que puede no estar disponible al inicio
  readonly date?: Date; // Fecha opcional, se puede inicializar con la fecha actual
  readonly location?: string; // Ubicación opcional
}