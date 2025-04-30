export interface GovernanceInfo {
  proposal_id: string;
  num_votes: number;
  should_pass: boolean;
  staking_pool_address: string;
  transaction_timestamp: string;
  transaction_version: number;
  voter_address: string;
}

export interface TokenSentimentInfo {
  name: string;
  price: number;
  change_24h: number;
  transaction_timestamp: number;
  sentiment: string;
  description: string;
}

export interface TokenIndicatorInfo {
  name: string;
  symbol: string;
  price: number;
  volume_24h: number;
  rsi: number;
  moving_average_50d: number;
  moving_average_200d: number;
  signal: string;
  description: string;
}

export interface TokenInfo {
  id: string;
  name: string;
  tickerSymbol: string;
  desc: string | null;
  creator: string;
  mintAddr: string;
  image: string;
  twitter: string | null;
  telegram: string | null;
  website: string | null;
  status: string;
  cdate: string;
  creatorName: string;
  creatorWalletAddr: string;
  creatorAvatar: string | null;
  replies: number;
  marketCapUSD: number | null;
  trades: TradeInfo[];
  aptosUSDPrice: number | null;
  holderPercentage: string | number;
  bondinCurvepercentage: number;
  seeded: string | null;
  exchange: string;
  pool_url: string;
}

export interface TokenInfoSui {
  token_address: string;
  bonding_curve: string;
  created_at: string;
  created_by: string;
  deployment_fee: string;
  description: string;
  full_updated: boolean;
  is_completed: boolean;
  lp_type: number;
  market_cap_sui: number;
  market_cap_usd: number;
  name: string;
  pool_id: string;
  real_sui_reserves: string;
  real_token_reserves: string;
  remain_token_reserves: string;
  symbol: string;
  telegram: string;
  token_metadata: {
    decimals: number;
    name: string;
    symbol: string;
    description: string;
    iconUrl: string;
    id: string;
  };
  token_price_sui: number;
  token_price_usd: number;
  token_supply: string;
  twitter: string;
  updated_at: string;
  uri: string;
  virtual_sui_reserves: string;
  virtual_token_reserves: string;
  volume_24h_sui: number;
  volume_24h_usd: number;
  volume_sui: string;
  volume_usd: string;
  website: string;
}

export interface TokenMoveFunInfo {
  address: string;
  type: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  creator: string;
  socials: {
    telegram: string;
    twitter: string;
    website: string;
  };
  marketData: {
    marketCap: number;
    tokenPriceUsd: number;
    totalVolumeUsd: number;
    liquidityUsd: number;
  };
  bondingProgress: number;
  createdAt: string;
  updatedAt: string;
  isMigrated: boolean;
  migrationInfo: string | null;
  pool_url?: string | null;
  price_change_percentage?: {
    "24H": string | null;
    "1H": string | null;
    "5M": string | null;
    "15M": string | null;
  };
}

export interface TradeInfo {
  side: string;
  count: string;
  volume: string;
}

export interface TxnInfo {
  tokenMint: string;
  txnHash: string;
  side: string;
  username: string;
  userWalletAddr: string;
  userAvatar: string | null;
  xAmt: string;
  yAmt: string;
  gas: null;
  timestamp: string;
  status: string;
}

export interface PoolInfo {
  token: string;
  apr: string;
  unit: string;
  protocol: string;
}

export interface SwapPool {
  id: number;
  attributes: {
    title: string;
    description_en: string;
    description_zh: string;
    link: string;
    apy: string | null;
    category: string;
    vToken: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    apy_var: string | null;
    logo: {
      data: {
        id: number;
        attributes: {
          name: string;
          alternativeText: string | null;
          caption: string | null;
          width: number;
          height: number;
          formats: string | null;
          hash: string;
          ext: string;
          mime: string;
          size: number;
          url: string;
          previewUrl: string | null;
          provider: string;
          provider_metadata: string | null;
          createdAt: string;
          updatedAt: string;
        };
      };
    };
  };
}

export interface PricePredictionData {
  _id: string;
  coin: string;
  lastUpdated: number;
  buyTrades: number;
  sellTrades: number;
  firstTradeTime: number;
  lastTradeTime: number;
  currentVolumeWeightedAveragePrice: number;
  currentShortTermMovingAveragePrice: number;
  currentLongTermMovingAveragePrice: number;
  currentMovingAveragePriceAnalysis: string;
  currentPriceLow: number;
  currentPriceHigh: number;
  expectedPriceHighInNext24Hours: number;
  expectedPriceLowInNext24Hours: number;
  expectedPriceTrends: string[];
  likelyAveragePriceInNext24Hours: number;
  totalUniqueUsers: number;
  coinMetadata: {
    _id: string;
    coinType: string;
    decimals: 9;
    description: string;
    iconUrl: string;
    id: string;
    name: string;
    symbol: string;
  };
  coinPrice: number;
}

interface Token {
  _id: string;
  symbol: string;
  name: string;
  icon_uri?: string;
  address: string;
  decimals: number;
  type: string;
  wrapAddress: string;
  project_uri?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  feedId?: string;
  active?: boolean;
  logo_url?: string;
}

interface Bribe {
  reward: number;
  quoteReward: number;
  token: Token;
}

interface Gauge {
  address: string;
  feesAddress: string;
  bribeAddress: string;
  rewardPool: string;
  tbv: number;
  fees: any[];
  bribes: Bribe[];
  nextIncentivize: any[];
  apr: number;
  votes: string;
  gaugeStatus: string;
  votesPercent: number;
}

export interface Pool {
  pool: {
    _id: string;
    name: string;
    symbol: string;
    address: string;
    apr: number;
    stable: boolean;
    tvl: number;
    totalSupply: number;
    reserve0: number;
    reserve1: number;
    token0Address: string;
    wrapToken0Address: string;
    token0: Token;
    token1Address: string;
    wrapToken1Address: string;
    token1: Token;
    gaugeAddress: string;
    gauge: Gauge;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  staked0: number;
  staked1: number;
}

export interface TokenAnalysis {
  priceData: DataPoint[];
  volumeData: DataPoint[];
  holders: {
    current: number;
    previous: number;
    growthRate: number;
  };
  liquidity: {
    score: number;
    pools: LiquidityPool[];
  };
  riskAssessment: {
    level: "Low" | "Medium" | "High";
    score: number;
    reasons: string[];
  };
}

export interface DataPoint {
  date: string;
  value: number;
}

export interface LiquidityPool {
  name: string;
  value: number;
}

export interface TokenInputForm {
  tokenAddress: string;
  days: number;
}

export interface TokenMetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  status?: "positive" | "neutral" | "negative";
  items?: string[];
}

export interface DataChartProps {
  data: DataPoint[];
  type: "line" | "bar";
  color?: string;
}

interface NftMetadata {
  name: string;
  image: string;
  attributes: {
    date: string;
    score: number;
  };
  description: string;
}

export interface TetrisScore {
  id: number;
  email: string;
  move_wallet: string;
  score: number;
  nft_metadata: NftMetadata;
  created_at: string;
  updated_at: string;
}
