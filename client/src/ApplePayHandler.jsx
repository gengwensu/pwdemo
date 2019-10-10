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

const getOnValidateMerchant = (session, pwToken) => {
  return event => {
    performValidation(event, pwToken)
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
        console.log("after session.completeMerchantValidation");
      })
      .catch(err => {
        console.log("Validate error ", JSON.stringify(err));
        // session.abort();
      });
  };
};

const performValidation = (event, pwToken) => {
  const request = {
    request: "getApplePaySession",
    url: event.validationURL,
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

const getOnPaymentAuthorized = (session, pwToken, amount) => {
  return event => {
    performApplePayQRequest(
      event,
      amount,
      pwToken,
      event.payment.token.paymentData
    )
      .then(response => {
        if (response.code === 100) {
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
        } else {
          console.log("Payment error in response ", JSON.stringify(response));
          session.completePayment(window.ApplePaySession.STATUS_FAILURE);
        }
      })
      .catch(err => {
        console.log("Payment error ", JSON.stringify(err));
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
      });
  };
};

const performApplePayQRequest = (event, amount, pwToken, data) => {
  const request = {
    request: "authorize",
    url: event.validationURL,
    paywaySessionToken: pwToken,
    applePayToken: data,
    accountInputMode: "applePayToken",
    cardTransaction: {
      eciType: 2,
      name: "",
      idSource: 11,
      amount: amount
    },
    cardAccount: {
      zip: 10001
    }
  };
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
