export function stellarTestnetTxUrl(txHash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

export function stellarTestnetAccountUrl(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address}`;
}
