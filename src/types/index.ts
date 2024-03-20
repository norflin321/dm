export type TRequestObject = {
  uri: string;
  json: true;
  headers?: { authorization: string };
  timeout: number;
};

export type TGameId = 'a8db' | '9a92' | 'tf2';

export type TItem = {
  itemId: string;
  type: 'target' | 'offer';
  amount: number;
  classId: string;
  gameId: TGameId;
  gameType: string;
  inMarket: boolean;
  lockStatus: boolean;
  title: string;
  description: string;
  image: string;
  slug: string;
  owner: string;
  ownersBlockchainId: string;
  ownerDetails: {
    id: string;
    avatar: string;
    wallet: string;
  };
  status: string;
  discount: number;
  price: { DMC: string; USD: string };
  instantPrice: { DMC: string; USD: string };
  instantTargetId: string;
  suggestedPrice: { DMC: string; USD: string };
  recommendedPrice: {
    d3: { DMC: string; USD: string };
    d7: { DMC: string; USD: string };
    d7Plus: { DMC: string; USD: string };
  };
  extra: {
    nameColor?: string;
    backgroundColor?: string;
    tradable: boolean;
    offerId?: string;
    isNew: boolean;
    gameId: TGameId;
    name: string;
    categoryPath: string;
    viewAtSteam: string;
    groupId?: string;
    linkId: string;
    exterior: string;
    quality?: string;
    category: string;
    tradeLockDuration: number | -1;
    stickers: { name: string; image: string }[];
    itemType: string;
    floatValue: number;
    inspectInGame: string;
    collection: string[];
    orbExpireDate: object;
  };
  createdAt: number;
  deliveryStats?: { rate: string; time: string };
};

export type TTotal = {
  offers: number;
  targets: number;
  items: number;
  completedOffers: number;
  closedTargets: number;
};

export type TAccountItemsData = {
  objects: TItem[];
  total: TTotal;
};

export type TFirestoreDataItem = {
  recentAvgPrice: number;
  recentSalesLength: number;
  recentAvgPrice15d: number;
  recentSales15dLength: number;
};

export type TAccData = {
  accName: string;
  balance: number;
  targets: { items: TTargetItem[]; total: string };
  offers: { items: TOfferItem[]; total: string };
};

export type TGetAdvicePriceRes = {
  name: string;
  bestTargetPrice: number;
  estimatedSellingPrice: number;
  newPrice: number;
  percent: number;
};

export type THistoryObject = {
  type: string;
  id: string;
  gameIcon: string;
  customId: string;
  emitter: string;
  action: string;
  subject: string;
  contractor: {
    id: string;
    title: string;
    type: string;
  };
  changes: { money: { amount: string; currency: string }; changeType: string }[];
  from: string;
  to: string;
  status: string;
  balance: { amount: string; currency: string };
  updatedAt: number;
};

export type TGetAccountHistoryRes = {
  objects: THistoryObject[];
  total: number;
};

export type TAccName = 'norflin' | 'rqqrfmityu' | '';

export type TAccounts = {
  [key: string]: {
    publicKey: string;
    secretKey: string;
  };
};

export type TAggregatedPrice = {
  MarketHashName: string;
  Offers: { BestPrice: string; Count: number };
  Orders: { BestPrice: string; Count: number };
};

export type TAggregatedPricesObj = {
  [key in TAggregatedPrice['MarketHashName']]: {
    Offers: { BestPrice: string; Count: number };
    Orders: { BestPrice: string; Count: number };
  };
};

export type TOfferItem = {
  AssetID: string;
  VariantID: string;
  Title: string;
  ImageURL: string;
  GameID: TGameId;
  GameType: string;
  Location: string;
  Withdrawable: boolean;
  Depositable: boolean;
  Tradable: boolean;
  Attributes: [];
  Offer: {
    OfferID: string;
    Price: { Currency: string; Amount: number };
    Fee: any | null;
    CreatedDate: string;
  };
  MarketPrice: any;
  InstantPrice: any;
  ClassID: string;
};

export type TTargetItem = {
  TargetID: string;
  Title: string;
  Amount: string;
  Status: 'TargetStatusInactive' | 'TargetStatusActive';
  GameID: TGameId;
  GameType: 'GameTypeSteam' | 'GameTypeBlockchain';
  Attributes: { Name: string; Value: string }[];
  Price: { Currency: string; Amount: number };
};

export type TGetAccOffersRes = {
  Items: TOfferItem[];
  Total: string;
  Cursor: string;
};

export type TGetAccTargetsRes = {
  Items: TTargetItem[];
  Total: string;
  Cursor: string;
};

export type TNewTargetData = {
  name: string;
  bestOfferPrice: number;
  bestTargetPrice: number;
  estimatedSellingPrice: number;
  newPrice: number;
  percent: number;
  profitAfterSale: number;
  firestoreData: TFirestoreDataItem;
  profitIndex: number;
  targetId?: string;
};

export type TUpdateOfferData = {
  OfferID: string;
  AssetID: string;
  Price: {
    Currency: string;
    Amount: number;
  };
};

export type TCreateOfferData = {
  AssetID: string;
  Price: {
    Currency: string;
    Amount: number;
  };
};

export type TFirestoreData = {
  items: { [key: string]: TFirestoreDataItem };
  updated: number;
};

export type TAccsClosedTargets = { [key: string]: THistoryObject[] };

export type TRevenue = {
  [key: string]: { allOffersPurchasedFor: number; allOffersOnSaleFor: number };
};

export type TBumpStatistic = { [key: string]: any[] };

export type TOfferDataForBump = {
  purchasePrice: number;
  offerPrice: number;
  bestPriceOnMarket: number;
  bestPriceAmongAllAccs: number;
  daysSincePurchase: number;
};

export type TFilterFirebaseForNewTargetsRes = {
  filtered: { [key: string]: TFirestoreDataItem };
  filteredWithMyTargets: { [key: string]: TFirestoreDataItem };
};

export type TEvaluateForTargetRes = {
  name: string;
  bestOfferPrice: number;
  bestTargetPrice: number;
  estimatedSellingPrice: number;
  newPrice: number;
  percent: number;
  profitAfterSale: number;
  firestoreData: TFirestoreDataItem;
  profitIndex: number;
};

export type TEvaluateMyTargestRes = {
  [key: string]: {
    name: string;
    bestOfferPrice: number;
    bestTargetPrice: number;
    estimatedSellingPrice: number;
    newPrice: number;
    percent: number;
    profitAfterSale: number;
    firestoreData: TFirestoreDataItem;
    profitIndex: number;
    myTargetId: string;
  }[];
};
