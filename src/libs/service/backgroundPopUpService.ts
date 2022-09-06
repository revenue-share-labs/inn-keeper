import browser from "webextension-polyfill";
import {
  BackgroundEvents,
  backgroundEventsEmitter,
  popUpEventEmitter,
  RESPONSE,
} from "../event";
import memoryStore from "../store/memoryStore";
import { confirmWalletSeqNo } from "./walletService";

/**
 * Service methods and subscription to handle PopUp events
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

let popUpPort: browser.Runtime.Port;

export const setPopUpPort = (port: browser.Runtime.Port) => {
  popUpPort = port;
};

export const sendMessageToPopUp = <Payload>(
  method: keyof BackgroundEvents | typeof RESPONSE,
  id?: number,
  params?: Payload
) => {
  const message = {
    method,
    id,
    params,
  };
  console.log("background", message);
  popUpPort.postMessage(message);
};

export const sendResponseToPopUp = <Payload>(id?: number, params?: Payload) => {
  sendMessageToPopUp(RESPONSE, id, params);
};

popUpEventEmitter.on("isLock", (message) => {
  sendResponseToPopUp(message.id, memoryStore.isLock());
});

popUpEventEmitter.on("getPassword", (message) => {
  sendResponseToPopUp(message.id, memoryStore.getPassword());
});

popUpEventEmitter.on("setPassword", (message) => {
  sendResponseToPopUp(message.id, memoryStore.setPassword(message.params));
  sendMessageToPopUp("unlock");
});

popUpEventEmitter.on("tryToUnlock", (message) => {
  memoryStore.setPassword(message.params);
  backgroundEventsEmitter.emit("unlock");
  sendMessageToPopUp("unlock");
});

popUpEventEmitter.on("lock", () => {
  memoryStore.setPassword(null);
  backgroundEventsEmitter.emit("locked");
  sendMessageToPopUp("locked");
});

popUpEventEmitter.on("storeOperation", (message) => {
  memoryStore.setOperation(message.params);
});

popUpEventEmitter.on("getOperation", (message) => {
  sendResponseToPopUp(message.id, memoryStore.getOperation());
});

popUpEventEmitter.on("confirmSeqNo", async (message) => {
  try {
    await confirmWalletSeqNo(message.params);
    sendResponseToPopUp(message.id);
  } catch (e) {
    console.error(e);
    sendResponseToPopUp(message.id);
  }
});

// Just Proxy messages to background service
popUpEventEmitter.on("approveRequest", (message) => {
  backgroundEventsEmitter.emit("approveRequest", message);
});

popUpEventEmitter.on("rejectRequest", (message) => {
  backgroundEventsEmitter.emit("rejectRequest", message);
});

popUpEventEmitter.on("approveTransaction", (message) => {
  backgroundEventsEmitter.emit("approveTransaction", message);
});

popUpEventEmitter.on("chainChanged", (message) => {
  backgroundEventsEmitter.emit("chainChanged", message);
});
// End of proxy messages