import { random } from 'lodash';

export class GenerateGameID {
    //生成游戏ID
    private static counter = 0;

    public static generateGameId(player1: string, player2: string): string {
        // 按字母顺序排序，确保相同玩家组合产生相同ID
        const sortedIds = [player1, player2].sort();
        const timestamp = Date.now();
        const counter = this.counter++;
        return `${sortedIds[0]}_${sortedIds[1]}_${timestamp}_${counter}`;
    }
}
