export class UpdateTeamDto {
    readonly name?: string;
    readonly category?: string;
    readonly team_photo?: string;
    readonly players?: string[];
    readonly coach?: string;
    readonly wins?: number;
    readonly losses?: number;
    readonly gamesPlayed?: number;
}