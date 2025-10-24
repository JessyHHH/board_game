export enum WEBSOCKET_STATUS {
    CONNECTED,
    DISCONNECTED,
}

export enum MESSAGE_TYPE {
    INITIALIZED = 'initialized',
    GAME_MATCH = 'game-match',
    GAME_MATCH_CANCEL = 'game-match-cancel',
    GAME_MATCHED = 'game-matched',
}

export enum GAME_IDS {
    GOMOKU = 'gomoku',
}
