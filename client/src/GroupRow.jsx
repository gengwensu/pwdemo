import React, { Component } from "react";
import { Button, ButtonGroup } from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import "./ApplePay.css";
import ApplePayButton from "./ApplePayButton";
import { performApplePayPayment } from "./ApplePayHandler";

class GroupRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payee: this.props.payee,
      sessionToken: this.props.sessionToken
    };
    this.remove = this.remove.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  async remove(id) {
    await fetch(`/api/groups/${id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
    this.props.history.push("/groups");
  }

  handleChange(event) {
    const payee = this.state.payee;
    payee.amount = event.target.value;

    this.setState({ payee: payee });
  }

  onClick() {
    console.log("amount passed in: ", this.state.payee.amount);
    performApplePayPayment(this.state.payee.amount, this.state.sessionToken)
      .then(status => {
        console.log("payment status: ", status);
      })
      .catch(err => {
        console.log("payment failure", err);
      });
  }

  render() {
    const { payee, sessionToken } = this.state;
    return (
      <tr>
        <td style={{ whiteSpace: "nowrap" }}>{payee.name}</td>
        <td>{payee.address}</td>
        <td>{payee.account}</td>
        <td>
          <input
            type="number"
            name="amount"
            id="amount"
            value={payee.amount || ""}
            onChange={e => this.handleChange(e)}
          />
        </td>
        <td>
          <ButtonGroup>
            <Button
              size="sm"
              color="primary"
              onClick={() => {
                this.props.history.push({
                  pathname: `/creditcard`,
                  state: { amount: payee.amount, sessionToken: sessionToken }
                });
              }}
            >
              Credit Card
            </Button>
            <ApplePayButton onClick={() => this.onClick()} />
          </ButtonGroup>
        </td>
        <td>
          <ButtonGroup>
            <Button
              size="sm"
              color="primary"
              tag={Link}
              to={"/groups/" + payee.id}
            >
              Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              onClick={() => this.remove(payee.id)}
            >
              Delete
            </Button>
          </ButtonGroup>
        </td>
      </tr>
    );
  }
}
export default withRouter(GroupRow);
