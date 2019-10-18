// present the payment sheet when apple pay button is clicked
/* let window.ApplePaySession; */

function applePayClicked() {
  try {
    var amount = document.getElementById("amount").value.replace("$", "");

    var paymentRequest = {
      countryCode: "US",
      currencyCode: "USD",

      billingContact: {
        name: document.getElementById("last").value,
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

    var session = new ApplePaySession(1, paymentRequest);
  } catch (err) {
    alert("Create apple pay session: " + err.message);
  }

  session.onvalidatemerchant = function(event) {
    console.log("In session.onvalidateMerchant. amount: ", amount);
    var request = new XMLHttpRequest();

    // posting to the configured target PaywayWS site
    request.open(
      "POST",
      document.getElementById("service").value + "/Session",
      true
    );
    request.setRequestHeader("Content-type", "application/json");

    request.onload = function() {
      if (request.status === 200) {
        try {
          var json_object = JSON.parse(request.responseText);
          console.log(
            "before completeMerchantValidation. appleSessionToken: ",
            JSON.parse(json_object.appleSessionToken)
          );
          session.completeMerchantValidation(
            JSON.parse(json_object.appleSessionToken)
          );
        } catch (err) {
          alert("apple merchant validation error: " + err);
        }
      } else {
        alert(
          "Apple Pay merchant validation error: " +
            request.status +
            " " +
            request.responseText
        );
      }
    };

    request.onerror = function() {
      request.onload();
    };

    try {
      var json = JSON.stringify({
        request: "getApplePaySession",
        url: event.validationURL,
        paywayTransactionToken: document.getElementById(
          "paywayTransactionToken"
        ).value
      });

      request.send(json);
    } catch (err) {
      alert("validation reply error: " + err.message);
    }
  };

  session.onpaymentauthorized = function(event) {
    var request = new XMLHttpRequest();

    request.onload = function() {
      try {
        var jsonObject = JSON.parse(request.responseText);
      } catch (err) {
        alert("Payment error: " + err);
      }

      if (request.status === 200) {
        session.completePayment(ApplePaySession.STATUS_SUCCESS);
      } else {
        session.completePayment(ApplePaySession.STATUS_FAILURE);
      }

      try {
        // set the response in the current document and submit to sample confirmation page
        document.getElementById("results").value = request.responseText;
        document.getElementById("TransactionResults").submit();
      } catch (err) {
        alert("Page error: " + err);
      }
    };

    request.onerror = function() {
      alert("Payment error: " + request.responseText);
    };

    try {
      // Set up the json request
      var requestjson = {
        accountInputMode: "applePayToken",
        paywayTransactionToken: document.getElementById(
          "paywayTransactionToken"
        ).value,
        transactionName: document.getElementById("transactionName").value,
        transactionSourceId: document.getElementById("transactionSourceId")
          .value,
        request: "sendQueuedTransaction",
        applePayData: event.payment.token.paymentData,

        cardAccount: {
          firstName: document.getElementById("first").value,
          lastName: document.getElementById("last").value,
          address: document.getElementById("address").value,
          city: document.getElementById("city").value,
          state: document.getElementById("state").value,
          zip: document.getElementById("zip").value,
          email: document.getElementById("email").value,
          phone: document.getElementById("phone").value,
          accountNotes1: "notes1",
          accountNotes2: "notes2",
          accountNotes3: "notes3"
        }
      };

      request.open(
        "POST",
        document.getElementById("service").value + "/Payment/CreditCard",
        true
      );
      request.setRequestHeader("Content-type", "application/json");
      request.send(JSON.stringify(requestjson));
    } catch (err) {
      alert("sendQueuedTransaction error: " + err.message);
    }
  };

  session.begin();
}

// hide or show the apple pay button depending on the availability
// of apple pay.
function initApplePayButtons() {
  if (window.ApplePaySession) {
    // This checks the device is enabled for Apple Pay
    var promise = ApplePaySession.canMakePaymentsWithActiveCard(
      "merchant.com.paywaycomplete.payway"
    );

    promise.then(function(canMakePayments) {
      console.log("InitApplePayButtons. canMakePayments: ", canMakePayments);
      // checks for wallet setup
      if (canMakePayments) {
        removeElement("no-apple-pay-button");
      } else {
        removeElement("apple-pay-button");
      }
    });
  } else {
    removeElement("apple-pay-button");
  }
}

function removeElement(elementId) {
  // Removes an element from the document
  var element = document.getElementById(elementId);
  element.parentNode.removeChild(element);
}
