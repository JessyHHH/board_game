import { MoneyTier } from './common-type';

export interface MatchingPlayer {
    userId: number;
    balance: number;
    tier: MoneyTier;
    matchStartTime: number;
}
