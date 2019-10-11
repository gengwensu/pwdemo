import React, { Component } from "react";
import { isApplePayJsAvailable } from "./ApplePayHandler";
import "./ApplePay.css";

const ApplePayButtonStatus = { UNKNOWN: 0, AVAILABLE: 1, NOT_AVAILABLE: 2 };

class ApplePayButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      applePayButtonStatus: ApplePayButtonStatus.UNKNOWN
    };
  }

  componentDidMount() {
    isApplePayJsAvailable()
      .then(canMakePayments => {
        console.log(
          "calling isApplePayJsAvailable. canMakePayments: ",
          canMakePayments
        );
        /* this.setState({
          applePayButtonStatus: canMakePayments
            ? ApplePayButtonStatus.AVAILABLE
            : ApplePayButtonStatus.NOT_AVAILABLE
        }); */
        this.setState({ applePayButtonStatus: ApplePayButtonStatus.AVAILABLE });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          applePayButtonStatus: ApplePayButtonStatus.NOT_AVAILABLE
        });
      });
  }

  render() {
    if (this.state.applePayButtonStatus === ApplePayButtonStatus.UNKNOWN)
      return null;

    return (
      <div className="row" id="apple-pay-row">
        {this.state.applePayButtonStatus === ApplePayButtonStatus.AVAILABLE && (
          <div className="text-center">
            <div
              className="apple-pay-button apple-pay-button-black"
              id="apple-pay"
              onClick={() => {
                this.props.onClick();
              }}
            ></div>
          </div>
        )}
        {this.state.applePayButtonStatus ===
          ApplePayButtonStatus.NOT_AVAILABLE && (
          <div className="btn btn-danger btn-sm" id="apple-pay-activation">
            ApplePay inactive
          </div>
        )}
      </div>
    );
  }
}

export default ApplePayButton;
