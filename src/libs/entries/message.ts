export interface DAppMessage {
  id: number;
  method: string;
  params: any;
  origin: string;
  event: boolean;
}

export type InnKeeperApiMessage = InnKeeperApiResponse | InnKeeperApiEvent;

export interface InnKeeperError {
  message: string;
  code: number;
  description?: string;
}
export interface InnKeeperApiResponse {
  type: "InnKeeperAPI";
  message: {
    jsonrpc: "2.0";
    id: number;
    method: string;
    result: undefined | unknown;
    error?: InnKeeperError;
  };
}

export interface InnKeeperApiEvent {
  type: "InnKeeperAPI";
  message: {
    jsonrpc: "2.0";
    id?: undefined;
    method: "accountsChanged" | "chainChanged";
    result: undefined | unknown;
    error?: InnKeeperError;
  };
}
