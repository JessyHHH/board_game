module.exports = {
  apps: [{
    name: 'board_game',
    script: './main.js',
    instances: 'max',        // 多核负载均衡
    exec_mode: 'cluster',
    env: { NODE_ENV: 'nest-demo', PORT: 3001, ENVIRONMENT: 'debug' }
  }]
}