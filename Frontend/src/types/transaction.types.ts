export interface WithdrawPayload {
  AcctNum: string;
  Amount: number;
  Remarks?: string;
}

export interface TransferPayload {
  SourceAcctNum: string;
  DestinationAcctNum: string;
  Amount: number;
  Remarks?: string;
}

export interface TransactionRecord {
  TxnID: string;
  TxnDate: string;
  AcctNum: string;
  TxnDetail: string | null;
  WithdrawAmount: number;
  DepositAmount: number;
  Balance: number;
}

export interface WithdrawResponseData {
  acctNum: string;
  amountWithdrawn: number;
  remainingBalance: number;
  transaction: TransactionRecord;
}

export interface TransferResponseData {
  sourceAccount: string;
  destinationAccount: string;
  amountTransferred: number;
  sourceClosingBalance: number;
  sourceTransactionId: string;
  destTransactionId: string;
}