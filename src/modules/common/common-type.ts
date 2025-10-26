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
    // GOMOKU_GAME_OVER = 'gomoku-game-over',
}

export enum GAME_IDS {
    GOMOKU = 'gomoku',
}
