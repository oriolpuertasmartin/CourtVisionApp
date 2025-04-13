export class CreateTeamDto {
    readonly name: string;
    readonly category: string;
    readonly team_photo?: string;
    readonly user_id: string;
}