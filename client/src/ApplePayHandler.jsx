// const merchantIdentifier = "merchant.com.paywaycomplete.payway";
const APPLE_PAY_VERSION_NUMBER = 1;
const pwurl = "https://devedgilpayway.net/PaywayWS/";
const merchantIdentifier = "merchant.com.paywaycomplete.payway";
const PaymentStatus = { SUCCESS: 0, FAILURE: 1, CANCEL: 2 };

const existsApplePayJsApi = () => {
  return new Promise((resolve, reject) => {
    try {
      const enabled =
        window.ApplePaySession && window.ApplePaySession.canMakePayments();
      resolve(enabled);
    } catch (err) {
      reject(err);
    }
  });
};

export const isApplePayJsAvailable = () => {
  return existsApplePayJsApi().then(() => {
    return window.ApplePaySession.canMakePaymentsWithActiveCard(
      merchantIdentifier
    );
  });
};

const getPaymentRequest = amount => {
  return {
    currencyCode: "USD",
    countryCode: "US",
    billingContact: {
      name: "tester1",
      emailAddress: "123@456.com",
      phoneNumber: "567-333-9876"
    },

    lineItems: [
      {
        label: "Subscription",
        amount: amount
      }
    ],

    total: {
      label: "Total",
      amount: amount
    },
    supportedNetworks: ["amex", "discover", "masterCard", "visa"],
    merchantCapabilities: ["supports3DS", "supportsCredit"]
  };
};

const getOnValidateMerchant = (resolve, reject, session, pwToken) => {
  return event => {
    /* event.preventDefault(); */
    console.log("validateMerchant event!");
    performValidation(event.validationURL, pwToken)
      .then(response => {
        console.log("Merchant validation successful, response is: ", response);
        console.log(
          "before completeMerchantValidation. appleSessionToken : ",
          JSON.parse(response.appleSessionToken)
        );

        session.completeMerchantValidation(
          JSON.parse(response.appleSessionToken)
        );
        /* console.log("after session.completeMerchantValidation"); */
      })
      .catch(err => {
        console.log("Validate error ", err);
        session.abort();
      });
  };
};

const performValidation = (hostURL, pwToken) => {
  const request = {
    request: "getApplePaySession",
    url: hostURL,
    domain: "devedgilpayway.net",
    /* domain: window.location.hostname, */
    /* sessionType: "applePay", */
    paywaySessionToken: pwToken
  };
  return fetch(pwurl + "Session", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  }).then(res => res.json());
};

const getOnPaymentAuthorized = (resolve, reject, session, pwToken) => {
  return event => {
    event.preventDefault();
    console.log("PaymentAuthorized event!");
    performApplePayQRequest(pwToken, event.payment.token.paymentData)
      .then(response => {
        console.log("Q request successful, response is: ", response);
        if (response.status === 200) {
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
          resolve(PaymentStatus.SUCCESS);
        } else {
          console.log("Payment error in response ", JSON.stringify(response));
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
          resolve(PaymentStatus.FAILURE);
        }
      })
      .catch(err => {
        console.log("Payment error ", err);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        reject(err);
      });
  };
};

const performApplePayQRequest = (pwToken, data) => {
  const request = {
    request: "sendQueueTransaction",
    paywaySessionToken: pwToken,
    applePayData: data,
    accountInputMode: "applePayToken",
    transactionSourceId: 11,
    cardAccount: {
      zip: 10001
    }
  };
  console.log("in performApplePayQRequest, request: ", request);
  return fetch(pwurl + "Payment/CreditCard", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  }).then(res => res.json());
};

/* const getOnCancel = (resolve, reject, session) => {
  return event => {
    console.log("Session cancelled!!!");
    resolve(PaymentStatus.CANCEL);
  };
}; */

export const performApplePayPayment = (amount, token) => {
  return new Promise((resolve, reject) => {
    const session = new window.ApplePaySession(
      APPLE_PAY_VERSION_NUMBER,
      getPaymentRequest(amount)
    );

    session.onvalidatemerchant = getOnValidateMerchant(
      resolve,
      reject,
      session,
      token
    );

    session.onpaymentauthorized = getOnPaymentAuthorized(
      resolve,
      reject,
      session,
      token
    );

    // session.oncancel = getOnCancel(resolve, reject, session);

    session.begin();
  });
};
