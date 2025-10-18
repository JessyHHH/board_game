export class GenerateGameID {
    //生成游戏ID
    public static generateGameId(player1: string, player2: string): string {
        //玩家1和玩家2的ID拼接在一起，加上时间戳
        return `${player1.slice(0, 6)}_${player2.slice(0, 6)}_${Date.now()}`;
    }
}
