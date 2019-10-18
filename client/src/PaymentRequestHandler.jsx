import {
  performValidation,
  performApplePayQRequest
} from "./ApplePayRestClient";
import { merchantIdentifier, APPLE_PAY_VERSION_NUMBER } from "./PaymentConf";
import { PaymentStatus } from "./PaymentStatus";

export const isPaymentRequestAvailable = () => {
  return new Promise((resolve, reject) => {
    try {
      const enabled = window.PaymentRequest ? true : false;
      resolve(enabled);
    } catch (err) {
      reject(err);
    }
  });
};

const getPaymentDetails = amount => {
  return {
    displayItems: [
      {
        label: "Subscription",
        amount: { value: amount, currency: "USD" }
      }
    ],
    total: {
      label: "Total",
      amount: { value: amount, currency: "USD" }
    }
  };
};

const applePayMethod = {
  supportedMethods: "https://apple.com/apple-pay",
  data: {
    version: APPLE_PAY_VERSION_NUMBER,
    merchantIdentifier: merchantIdentifier,
    merchantCapabilities: ["supports3DS"],
    supportedNetworks: ["amex", "discover", "masterCard", "visa"],
    countryCode: "US"
  }
};

const paymentOptions = {
  requestPayerName: false,
  requestPayerEmail: false,
  requestPayerPhone: false,
  requestShipping: false,
  shippingType: "shipping"
};

const paymentRequestValidateMerchant = pwToken => {
  return event => {
    console.log("in paymentRequestValidateMerchant", event);
    performValidation(event.validationURL, pwToken)
      .then(response => {
        console.log("Merchant validation successful, response is: ", response);
        console.log(
          "before completeMerchantValidation. appleSessionToken : ",
          JSON.parse(response.appleSessionToken)
        );

        event.complete(JSON.parse(response.appleSessionToken));
        /* event.complete(response.appleSessionToken); */
        console.log("after session.completeMerchantValidation");
      })
      .catch(err => {
        console.log("Validate error ", err);
      });
  };
};

const paymentRequestComplete = (resolve, reject, instrument, isError) => {
  const resolveStatus = !isError
    ? PaymentStatus.SUCCESS
    : PaymentStatus.FAILURE;
  const completeStatus = !isError ? "success" : "failure";
  instrument
    .complete(completeStatus)
    .then(() => {
      resolve(resolveStatus);
    })
    .catch(err => {
      console.log("Complete error:", err);
      reject(err);
    });
};

const paymentRequestPerformPayment = (
  resolve,
  reject,
  showPromise,
  pwToken
) => {
  console.log("in paymentRequestPerformPayment");
  showPromise.then(
    instrument => {
      performApplePayQRequest(pwToken, instrument.details.token.paymentData)
        .then(response => {
          if (response.code === 100) {
            console.log("Payment done!");
            paymentRequestComplete(resolve, reject, instrument);
          } else {
            console.log("Payment error in response ", JSON.stringify(response));
            paymentRequestComplete(resolve, reject, instrument, true);
          }
        })
        .catch(err => {
          console.log("Payment error ", JSON.stringify(err));
          paymentRequestComplete(resolve, reject, instrument, true);
        });
    },
    failure => {
      resolve(
        failure.name === "AbortError"
          ? PaymentStatus.CANCEL
          : PaymentStatus.FAILURE
      );
    }
  );
};

export const performApplePayPayment = (amount, pwToken) => {
  return new Promise((resolve, reject) => {
    try {
      const paymentDetails = getPaymentDetails(amount);
      console.log("getPaymentDetail: ", paymentDetails);
      const paymentRequest = new window.PaymentRequest(
        [applePayMethod],
        paymentDetails,
        paymentOptions
      );

      paymentRequest.onmerchantvalidation = paymentRequestValidateMerchant(
        pwToken
      );

      const showPromise = paymentRequest.show();

      paymentRequestPerformPayment(resolve, reject, showPromise, pwToken);
    } catch (err) {
      reject(err);
    }
  });
};
