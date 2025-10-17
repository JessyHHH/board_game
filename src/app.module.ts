import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GomokuService } from './src/modules/gomoku/gomoku.service';
import { GomokuService } from './modules/gomoku/gomoku.service';
import { GomokuController } from './modules/gomoku/gomoku.gateway';
import { GomokuService } from './modu-dcles/gomoku/gomoku.service';
import { GomokuService } from './modules/gomoku/gomoku.service';

@Module({
    imports: [],
    controllers: [AppController, GomokuController],
    providers: [AppService, GomokuService],
})
export class AppModule {}
