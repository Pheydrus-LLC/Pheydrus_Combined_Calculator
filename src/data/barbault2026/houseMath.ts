import { ZODIAC_SIGNS } from '../../utils/data/constants';
import { getHouseFromSignIndex } from '../../utils/astro/houses';

export type RisingSign = (typeof ZODIAC_SIGNS)[number];

export function getHouseForSign(sign: string, risingSign: RisingSign): number {
  const signIdx = ZODIAC_SIGNS.indexOf(sign as RisingSign);
  const ascIdx = ZODIAC_SIGNS.indexOf(risingSign);
  return getHouseFromSignIndex(signIdx, ascIdx);
}
