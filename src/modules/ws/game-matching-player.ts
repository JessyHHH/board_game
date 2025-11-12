import { MoneyTier } from '../common/common-type';

export class MatchingPlayer {
    public matchStartTime: number = Date.now();
    public tier: MoneyTier;

    public constructor(
        public userId: number,
        public balance: number,
    ) {
        this.tier = this.getMoneyTier(balance);
    }

    private getMoneyTier(balance: number): MoneyTier {
        if (balance < 1000) {
            return MoneyTier.LOW;
        } else if (balance < 2000) {
            return MoneyTier.MEDIUM;
        } else {
            return MoneyTier.HIGH;
        }
    }

    public isSameTier(other: MatchingPlayer): boolean {
        return this.tier === other.tier;
    }

    public isOpenMatch() {
        return Date.now() - this.matchStartTime >= 5000;
    }
}
