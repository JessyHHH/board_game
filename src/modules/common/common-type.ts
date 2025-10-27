export enum WEBSOCKET_STATUS {
    CONNECTED,
    DISCONNECTED,
}

export enum MESSAGE_TYPE {
    INITIALIZED = 'initialized',
    GAME_MATCH = 'game-match',
    GAME_MATCH_CANCEL = 'game-match-cancel',
    GAME_MATCHED = 'game-matched',
    GAME_JOIN_ROOM = 'game-join-room',
    GAME_START = 'game-start',

    GAME_INPUT = 'game-input',
    GAME_OVER = 'game-over', //处理胜利消息

    //处理时间
    GAME_TIME_UPDATE = 'game-time-update',
    GAME_TIME_OUT = 'game-time-out',
}

export enum GAME_IDS {
    GOMOKU = 'gomoku',
}
