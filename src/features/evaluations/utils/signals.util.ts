// --- Configuration ---
const RSI_PERIOD: number = 14; // Common RSI period
const MACD_FAST_PERIOD: number = 12; // Common MACD fast EMA period
const MACD_SLOW_PERIOD: number = 26; // Common MACD slow EMA period
const MACD_SIGNAL_PERIOD: number = 9; // Common MACD signal EMA period
const SHORT_EMA_PERIOD: number = 20; // Short-term EMA for price action
const BOLLINGER_BAND_PERIOD: number = 20; // Bollinger Band period
const BOLLINGER_BAND_STD_DEV: number = 2; // Standard deviations for Bollinger Bands
const RSI_OVERSOLD_THRESHOLD: number = 30; // RSI level to consider oversold
const MIN_VOLUME_INCREASE_FACTOR: number = 1.2; // How much higher current volume should be than average (e.g., 20% higher)

// --- Helper Functions (You'll need to implement these or use a library) ---

/**
 * Calculates the Exponential Moving Average (EMA) for a given set of prices.
 * @param {number[]} prices - Array of closing prices.
 * @param {number} period - The period for the EMA calculation.
 * @returns {number[]} - Array of EMA values.
 */
function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const k: number = 2 / (period + 1);
  const emaArray: number[] = [];
  // Calculate initial SMA for the first EMA point
  let sma: number =
    prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
  emaArray.push(sma);

  for (let i = period; i < prices.length; i++) {
    sma = prices[i] * k + emaArray[emaArray.length - 1] * (1 - k);
    emaArray.push(sma);
  }
  return emaArray;
}

/**
 * Calculates the Simple Moving Average (SMA) for a given set of prices.
 * @param {number[]} prices - Array of closing prices.
 * @param {number} period - The period for the SMA calculation.
 * @returns {number[]} - Array of SMA values.
 */
function calculateSMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const smaArray: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum: number = prices
      .slice(i - period + 1, i + 1)
      .reduce((acc, val) => acc + val, 0);
    smaArray.push(sum / period);
  }
  return smaArray;
}

/**
 * Calculates the Relative Strength Index (RSI).
 * @param {number[]} prices - Array of closing prices.
 * @param {number} period - The period for the RSI calculation.
 * @returns {number[]} - Array of RSI values.
 */
function calculateRSI(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  const rsiValues: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change: number = prices[i] - prices[i - 1];
    gains.push(Math.max(0, change));
    losses.push(Math.abs(Math.min(0, change)));
  }

  let avgGain: number =
    gains.slice(0, period).reduce((sum, g) => sum + g, 0) / period;
  let avgLoss: number =
    losses.slice(0, period).reduce((sum, l) => sum + l, 0) / period;

  if (avgLoss === 0) {
    // Avoid division by zero
    rsiValues.push(100);
  } else {
    const rs: number = avgGain / avgLoss;
    rsiValues.push(100 - 100 / (1 + rs));
  }

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs: number = avgGain / avgLoss;
      rsiValues.push(100 - 100 / (1 + rs));
    }
  }
  return rsiValues;
}

/**
 * Calculates the Moving Average Convergence Divergence (MACD).
 * @param {number[]} prices - Array of closing prices.
 * @param {number} fastPeriod - Period for the fast EMA.
 * @param {number} slowPeriod - Period for the slow EMA.
 * @param {number} signalPeriod - Period for the signal line EMA.
 * @returns {{macdLine: number[], signalLine: number[], histogram: number[]}} - Object containing macdLine, signalLine, and histogram arrays.
 */
function calculateMACD(
  prices: number[],
  fastPeriod: number,
  slowPeriod: number,
  signalPeriod: number,
): { macdLine: number[]; signalLine: number[]; histogram: number[] } {
  const fastEMA: number[] = calculateEMA(prices, fastPeriod);
  const slowEMA: number[] = calculateEMA(prices, slowPeriod);

  // Ensure EMAs are long enough for MACD calculation
  if (fastEMA.length === 0 || slowEMA.length === 0) {
    return { macdLine: [], signalLine: [], histogram: [] };
  }

  const macdLine: number[] = fastEMA
    .slice(fastEMA.length - slowEMA.length)
    .map((val, i) => val - slowEMA[i]);
  const signalLine: number[] = calculateEMA(macdLine, signalPeriod);

  const histogram: number[] = macdLine
    .slice(macdLine.length - signalLine.length)
    .map((val, i) => val - signalLine[i]);

  return { macdLine, signalLine, histogram };
}

/**
 * Calculates Bollinger Bands.
 * @param {number[]} prices - Array of closing prices.
 * @param {number} period - Period for the SMA.
 * @param {number} stdDev - Number of standard deviations.
 * @returns {{upper: number[], middle: number[], lower: number[]}} - Object containing upper, middle, and lower band arrays.
 */
function calculateBollingerBands(
  prices: number[],
  period: number,
  stdDev: number,
): { upper: number[]; middle: number[]; lower: number[] } {
  if (prices.length < period) return { upper: [], middle: [], lower: [] };

  const middleBand: number[] = calculateSMA(prices, period);
  const upperBand: number[] = [];
  const lowerBand: number[] = [];

  for (let i = period - 1; i < prices.length; i++) {
    const slice: number[] = prices.slice(i - period + 1, i + 1);
    const mean: number = middleBand[i - (period - 1)]; // Adjust index for SMA array
    const sumOfSquares: number = slice.reduce(
      (acc, val) => acc + Math.pow(val - mean, 2),
      0,
    );
    const standardDeviation: number = Math.sqrt(sumOfSquares / period);

    upperBand.push(mean + standardDeviation * stdDev);
    lowerBand.push(mean - standardDeviation * stdDev);
  }
  return { upper: upperBand, middle: middleBand, lower: lowerBand };
}

/**
 * Interface for a candlestick data object.
 */
interface Candlestick {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type MarketData = [
  number, // Open time (timestamp in milliseconds)
  string, // Open price
  string, // High price
  string, // Low price
  string, // Close price
  string, // Volume
  number, // Close time (timestamp in milliseconds)
  string, // Quote asset volume
  number, // Number of trades
  string, // Taker buy base asset volume
  string, // Taker buy quote asset volume
  string, // Ignore (or other unused field)
];

/**
 * Fetches historical candlestick data from the exchange API.
 * This is a placeholder. You'll need to replace it with your actual exchange API calls.
 * @param {string} symbol - Trading pair symbol (e.g., 'BTCUSDT').
 * @param {string} interval - Candlestick interval (e.g., '1h', '4h').
 * @param {number} limit - Number of historical candles to fetch.
 * @returns {Promise<Candlestick[]>} - Array of candlestick objects.
 */
async function fetchCandlestickData(
  symbol: string,
  interval: string,
  limit: number,
): Promise<Candlestick[]> {
  // Example: Binance API structure (replace with your actual exchange API)
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
  );
  const data = (await response.json()) as MarketData;
  const res = data.map((kline) => ({
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
    timestamp: parseFloat(kline[0]),
  }));

  return res;
}

/**
 * Determines if it's a good time to buy based on multiple technical indicators.
 * @param {string} symbol - The cryptocurrency symbol (e.g., 'BTCUSDT').
 * @param {string} interval - The candlestick interval (e.g., '1h', '4h').
 * @returns {Promise<boolean>} - True if conditions for buying are met, false otherwise.
 */
export async function shouldBuy(
  symbol: string,
  interval: string = '1h',
): Promise<boolean> {
  try {
    // Fetch enough data for all calculations (e.g., 200 candles for 200 EMA, etc.)
    const candles: Candlestick[] = await fetchCandlestickData(
      symbol,
      interval,
      Math.max(
        RSI_PERIOD,
        MACD_SLOW_PERIOD + MACD_SIGNAL_PERIOD, // MACD needs more data
        SHORT_EMA_PERIOD,
        BOLLINGER_BAND_PERIOD,
      ) + 50,
    ); // Add some buffer

    if (candles.length === 0) {
      console.warn('Not enough historical data to make a decision.');
      return false;
    }

    const closes: number[] = candles.map((c) => c.close);
    const volumes: number[] = candles.map((c) => c.volume);
    const currentPrice: number = closes[closes.length - 1];
    const currentVolume: number = volumes[volumes.length - 1];

    // --- 1. RSI Check ---
    const rsiValues: number[] = calculateRSI(closes, RSI_PERIOD);
    const currentRSI: number = rsiValues[rsiValues.length - 1];
    const previousRSI: number = rsiValues[rsiValues.length - 2]; // For crossover check

    const isRSIOversold: boolean = currentRSI < RSI_OVERSOLD_THRESHOLD;
    const isRSIBouncingFromOversold: boolean =
      currentRSI > RSI_OVERSOLD_THRESHOLD &&
      previousRSI <= RSI_OVERSOLD_THRESHOLD;

    const rsiCondition: boolean = isRSIOversold || isRSIBouncingFromOversold;
    console.log(
      `RSI (${RSI_PERIOD}): Current=${currentRSI.toFixed(2)}, Oversold=${RSI_OVERSOLD_THRESHOLD}. Condition Met: ${rsiCondition}`,
    );

    // --- 2. MACD Check ---
    const { macdLine, signalLine, histogram } = calculateMACD(
      closes,
      MACD_FAST_PERIOD,
      MACD_SLOW_PERIOD,
      MACD_SIGNAL_PERIOD,
    );
    const currentMACD: number = macdLine[macdLine.length - 1];
    const currentSignal: number = signalLine[signalLine.length - 1];
    const previousMACD: number = macdLine[macdLine.length - 2];
    const previousSignal: number = signalLine[signalLine.length - 2];

    const isMACDBullishCrossover: boolean =
      currentMACD > currentSignal && previousMACD <= previousSignal;
    const isMACDAboveZero: boolean = currentMACD > 0; // Optional: MACD above zero confirms bullish trend

    const macdCondition: boolean = isMACDBullishCrossover; // Focus on crossover for buy signal
    console.log(
      `MACD (${MACD_FAST_PERIOD},${MACD_SLOW_PERIOD},${MACD_SIGNAL_PERIOD}): MACD=${currentMACD.toFixed(2)}, Signal=${currentSignal.toFixed(2)}. Crossover Met: ${macdCondition}`,
    );

    // --- 3. Short-term EMA Check ---
    const shortEMA: number[] = calculateEMA(closes, SHORT_EMA_PERIOD);
    const currentShortEMA: number = shortEMA[shortEMA.length - 1];

    const isPriceAboveShortEMA: boolean = currentPrice > currentShortEMA;
    const wasPriceBelowShortEMA: boolean =
      closes[closes.length - 2] <= shortEMA[shortEMA.length - 2]; // Price was below previous EMA

    const emaCondition: boolean = isPriceAboveShortEMA && wasPriceBelowShortEMA; // Price just crossed above EMA
    console.log(
      `Short EMA (${SHORT_EMA_PERIOD}): Price=${currentPrice.toFixed(2)}, EMA=${currentShortEMA.toFixed(2)}. Condition Met: ${emaCondition}`,
    );

    // --- 4. Bollinger Band Check (Optional) ---
    const { upper, middle, lower } = calculateBollingerBands(
      closes,
      BOLLINGER_BAND_PERIOD,
      BOLLINGER_BAND_STD_DEV,
    );
    const currentLowerBand: number = lower[lower.length - 1];

    const isPriceTouchingLowerBand: boolean = currentPrice <= currentLowerBand;
    const wasPriceBelowLowerBand: boolean =
      closes[closes.length - 2] < lower[lower.length - 2]; // Price was below previous lower band

    const bbCondition: boolean =
      isPriceTouchingLowerBand || wasPriceBelowLowerBand; // Price touched or was below lower band
    console.log(
      `Bollinger Bands (${BOLLINGER_BAND_PERIOD},${BOLLINGER_BAND_STD_DEV}): Price=${currentPrice.toFixed(2)}, Lower Band=${currentLowerBand.toFixed(2)}. Condition Met: ${bbCondition}`,
    );

    // --- 5. Volume Check (Optional) ---
    // Calculate average volume over a recent period (e.g., last 10 candles)
    const recentVolumes: number[] = volumes.slice(-10, -1); // Exclude current candle
    const averageRecentVolume: number =
      recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
    const isVolumeHigh: boolean =
      currentVolume > averageRecentVolume * MIN_VOLUME_INCREASE_FACTOR;

    const volumeCondition: boolean = isVolumeHigh;
    console.log(
      `Volume: Current=${currentVolume.toFixed(2)}, Avg Recent=${averageRecentVolume.toFixed(2)}. Condition Met: ${volumeCondition}`,
    );

    // --- Combine Conditions ---
    // You can adjust the weight or necessity of each condition.
    // This example requires RSI or MACD crossover, plus EMA confirmation, and optionally BB or Volume.

    const finalBuySignal: boolean =
      (rsiCondition || macdCondition) &&
      emaCondition &&
      (bbCondition || volumeCondition);

    console.log(`Final Buy Signal for ${symbol}: ${finalBuySignal}`);
    return finalBuySignal;
  } catch (error: any) {
    // Use 'any' for error type if not specific
    console.error('Error in shouldBuy function:', error);
    return false;
  }
}

// --- Example Usage in your bot's main loop ---
// async function runBotLogic(): Promise<void> {
//   const cryptoSymbol: string = 'BTCUSDT'; // Example
//   const checkInterval: string = '1h'; // Check hourly candles
//
//   // Your existing logic for 8 AM EST or min price
//   const isEightAMEST: boolean = false;
//   const isCurrentPriceMinOfDay: boolean = false;
//
//   if (isEightAMEST || isCurrentPriceMinOfDay) {
//     console.log('Existing buy condition met.');
//     // Execute buy order
//   } else {
//     console.log('Checking advanced buy conditions...');
//     const advancedBuySignal: boolean = await shouldBuy(
//       cryptoSymbol,
//       checkInterval,
//     );
//     if (advancedBuySignal) {
//       console.log(
//         `Advanced buy signal detected for ${cryptoSymbol}! Executing buy order.`,
//       );
//       // Execute buy order
//     } else {
//       console.log(`No advanced buy signal for ${cryptoSymbol} at this time.`);
//     }
//   }
// }

// Call the bot logic periodically (e.g., every 5 minutes or 1 hour)
// setInterval(runBotLogic, 5 * 60 * 1000); // Every 5 minutes
// runBotLogic(); // Run once immediately for testing
