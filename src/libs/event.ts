import { EventEmitter } from "./eventEmitter";

export type IEventEmitter<T> = {
  on<Key extends string & keyof T>(
    method: `${Key}`,
    callback: (options: {
      method: `${Key}`;
      id?: number;
      params: T[Key];
    }) => void
  ): void;
  off<Key extends string & keyof T>(
    eventName: `${Key}`,
    callback: (options: {
      method: `${Key}`;
      id?: number;
      params: T[Key];
    }) => void
  ): void;
  emit<Key extends string & keyof T>(
    eventName: `${Key}`,
    params?: { method: `${Key}`; id?: number; params: T[Key] }
  ): void;
};

export type PopUpEventEmitter = IEventEmitter<PupUpEvents>;
export type BackgroundEventsEmitter = IEventEmitter<BackgroundEvents>;

export type AskProcessor<R> = {
  message<Key extends string & keyof PupUpEvents>(
    eventName: `${Key}`,
    params?: PupUpEvents[Key]
  ): R;
};

export type UnfinishedOperation = { kind: "send"; value: string } | null;

export interface PupUpEvents {
  isLock: void;
  tryToUnlock: string;
  unlock: void;
  lock: void;
  locked: void;
  getPassword: void;
  setPassword: string;
  approveRequest: number;
  rejectRequest: number;
  approveTransaction: ApproveTransaction;
  confirmSeqNo: number;
  storeOperation: UnfinishedOperation;
  getOperation: void;

  chainChanged: string;
  accountsChanged: string[];
  getWallets: string;
}

export interface ApproveTransaction {
  id: number;
  seqNo: number;
}

export interface BackgroundEvents {
  unlock: void;
  locked: void;
  approveRequest: number;
  rejectRequest: number;
  approveTransaction: ApproveTransaction;
  closedPopUp: number;

  chainChanged: string;
  accountsChanged: string[];
}

export const RESPONSE = "Response";

export type AppEvent<Key extends string, Payload = void> = {
  id?: number;
  method: Key;
  params: Payload;
};

export const popUpEventEmitter: PopUpEventEmitter = new EventEmitter();
export const backgroundEventsEmitter: BackgroundEventsEmitter =
  new EventEmitter();
