## 1. 象棋行走规则

| **棋子** | 数量 | 移动规则                         |
| -------- | ---- | -------------------------------- |
| 帅/将    | 1    | 在九宫内横竖各走一格             |
| 仕/士    | 2    | 在九宫内斜走一格                 |
| 相/象    | 2    | 田字格斜走，不能过河，不能塞象眼 |
| 马       | 2    | 日字走法，会被蹩马腿             |
| 车       | 2    | 横竖直线，无限距离               |
| 兵/卒    | 5    | 过河前只能前进，过河后可横向移动 |

## 2.胜利规则

- 将帅不能相见: 同一纵线上不能无子相隔

- 困毙: 无子可走即失败

- 长将/长捉: 连续将军或捉子判和

目前想不出该怎么写这个算法，先把行走逻辑的类写出来



## 3. 架构设计

``````
src/modules/games/xiangqi/
├── game-room-xiangqi.ts      # 游戏房间主类
├── player.ts                  # 玩家类
└── lib/
    ├── board.entity.ts        # 棋盘实体
    ├── piece.entity.ts        # 棋子实体
    ├── xiangqi-types.ts       # 类型定义
    └── rule-validator.ts      # 规则验证器
``````

### 3.1棋子类型枚举

``````typescript
export enum PieceType {
    GENERAL = 'general',    // 将/帅
    ADVISOR = 'advisor',    // 士/仕
    ELEPHANT = 'elephant',  // 象/相
    HORSE = 'horse',        // 马
    CHARIOT = 'chariot',    // 车
    CANNON = 'cannon',      // 炮
    SOLDIER = 'soldier',    // 兵/卒
}

export enum PlayerId {
    
}
``````

### 3.2棋子类
```typescript
import { PieceType } from ./lib/pieceType
export class Piece {
    public constructor(
        public x: number;
        public y: number,
        public type : PieceType;
        public color: PieceColor;
    ){}

    public getValidMove(board: board): 
} 
```

### 3.3 棋盘
```typescript
export class Board{
    private board: (number | null) [][]; //9x8

    constructor(){
         this.board = Array.from({ length: 9 }, () => Array(10).fill(null));
    }

    public placeStone(x: number, y: number, player: number): boolean {
        if (!this.isValidMove(x, y)) {
            return false;
        }
        if (this.board[x][y] !== null) {
            return false;
        }
        this.board[x][y] = player;
        return true;
    }

    //验证移动合法性
    public isValidMove(x: number, y: number, player:number): boolean {

    }

    //是否将军
    public isInCheck(color: PieceColor): boolean{

    }

    //吃棋
    private eatPieces(x: number, y:number, player:number): boolean{
        
    }
}
```

#### 棋子移动判断，根据前端传递的消息坐标

``````typescript
//前端传消息数据结构
{
  type: 'move';
  input: {
    from: {
      x: number;
      y: number;
    },
    to: {
      x: number;
      y: number;
    }
  };
}
``````

根据前端传递的消息里的坐标，后端从from的坐标提取出棋子参数，然后判断该棋子到to到位置合不合理

