import { pwurl } from "./PaymentConf";

export const performValidation = (hostURL, pwToken) => {
  const request = {
    request: "getApplePaySession",
    url: hostURL,
    /* domain: window.location.hostname, */
    domain: "devedgilpayway.net",
    /* domain: window.location.href.split("/")[2].toLowerCase(), */
    /* sessionType: "applePay", */
    paywayTransactionToken: pwToken
  };
  return fetch(pwurl + "/Session", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  }).then(res => res.json());
};

export const performApplePayQRequest = (pwToken, data) => {
  const request = {
    request: "sendQueueTransaction",
    paywayTransactionToken: pwToken,
    applePayData: data,
    accountInputMode: "applePayToken",
    transactionSourceId: 11,
    transactionName: "",
    cardAccount: {
      zip: 10001
    }
  };
  console.log("in performApplePayQRequest, request: ", request);
  return fetch(pwurl + "/Payment/CreditCard", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });
};
