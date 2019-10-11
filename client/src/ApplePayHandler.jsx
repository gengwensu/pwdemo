// const merchantIdentifier = "merchant.com.paywaycomplete.payway";
const APPLE_PAY_VERSION_NUMBER = 1;
const pwurl = "https://devedgilpayway.net/PaywayWS/";

export const isApplePayAvailable = async () => {
  if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
    console.log("in ApplePayHandler");
    let canMakePayments = await window.ApplePaySession.canMakePaymentsWithActiveCard(
      "merchant.com.paywaycomplete.payway"
    );
    console.log("isApplePayAvailable canMakePayments: ", canMakePayments);
    //return canMakePayments;
    return true;
  }
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
        amount: amount,
        type: "final"
      }
    ],

    total: {
      label: "Total",
      amount: amount,
      type: "final"
    },
    supportedNetworks: ["amex", "discover", "masterCard", "visa"],
    merchantCapabilities: ["supports3DS"]
  };
};

const getOnValidateMerchant = (resolve, reject, session, pwToken) => {
  return event => {
    console.log("validateMerchant event!");
    performValidation(event.validationURL, pwToken)
      .then(response => {
        console.log(
          "Merchant validation successful, response is: ",
          JSON.stringify(response)
        );
        console.log(
          "before completeMerchantValidation. appleSessionToken : ",
          JSON.parse(response.appleSessionToken)
        );

        session.completeMerchantValidation(
          JSON.parse(response.appleSessionToken)
        );
        //console.log("after session.completeMerchantValidation");
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
    paywayRequestToken: pwToken
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
    console.log("PaymentAuthorized event!");
    performApplePayQRequest(pwToken, event.payment.token.paymentData)
      .then(response => {
        console.log("Q request successful, response is: ", response);
        if (response.status === 200) {
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        } else {
          console.log("Payment error in response ", JSON.stringify(response));
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        }
      })
      .catch(err => {
        console.log("Payment error ", err);
        session.abort();
      });
  };
};

const performApplePayQRequest = (pwToken, data) => {
  const request = {
    request: "sendQueuedTransaction",
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
      token,
      amount
    );

    session.begin();
  });
};
