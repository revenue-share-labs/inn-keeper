/**
 * The background service worker - a script with run inside browser
 * The service is responsible to manage input and output events or requests from DApps and PopUp
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import browser from "webextension-polyfill";
import {
  handleDAppConnection,
  subscriptionDAppNotifications,
} from "./libs/service/backgroundDAppService";
import { handlePopUpConnection } from "./libs/service/backgroundPopUpService";

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "OpenMaskUI") {
    /**
     * Subscribing to events from PopUp UI
     * The background script is a kind of backend with responsible
     * to processing requests and store secure data in memory store.
     */
    handlePopUpConnection(port);
  }

  if (port.name === "OpenMaskContentScript") {
    /**
     * Subscribing to events from dApps
     * The background is responsible to be as a service or middleware,
     * it could completely handle request or open notification modal to user confirmations.
     */
    handleDAppConnection(port);
  }
});

/**
 * Subscribing to update events and send it to dApps
 */
subscriptionDAppNotifications();
