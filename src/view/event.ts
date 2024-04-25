import browser from "webextension-polyfill";
import { EventEmitter } from "../libs/entries/eventEmitter";
import {
  AppEvent,
  AskProcessor,
  PopUpEventEmitter,
  RESPONSE,
} from "../libs/event";
import { Logger } from "../libs/logger";

let port: browser.Runtime.Port;

export const uiEventEmitter: PopUpEventEmitter = new EventEmitter();

export const sendBackground: AskProcessor<void> = {
  message: (method, params) => {
    port.postMessage({ method, params });
  },
};

export const askBackground = <R>(timeout = 5000): AskProcessor<Promise<R>> => {
  return {
    message: (method, params) => {
      const id = Date.now();
      port.postMessage({ method, id, params: params });
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          port.onMessage.removeListener(handler);
          reject("Timeout");
        }, timeout);

        const handler = (message: AppEvent<string, R>) => {
          Logger.log("PopUp", message);
          if (message.method === RESPONSE && message.id === id) {
            clearTimeout(timer);
            resolve(message.params);
          }
        };

        port.onMessage.addListener(handler);
      });
    },
  };
};

export const connectToBackground = () => {
  port = browser.runtime.connect({ name: "InnKeeperUI" });

  port.onMessage.addListener((data) => {
    uiEventEmitter.emit<any>(data.method, data);
  });

  port.onDisconnect.addListener(() => {
    connectToBackground();
  });
};
