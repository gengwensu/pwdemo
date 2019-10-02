import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { Button, Container, Form, FormGroup, Input, Label } from "reactstrap";
import AppNavbar from "./AppNavbar";

class PWCCSetup extends Component {
    emptyCardAccount = {
      "fsv" : "",
      "accountNumber" : "",
      "expirationDate" : "",
      "zip" : ""
    };

    emptyResponse = {
        'paymentType' : '',
        'paywayCode' : '',
        'paywayMessage' : '',
        'paywayRequestToken' : '',
        'transactionName' : '',
        'amount' : 0,
        'idSource' : '',
        'idDivision' : ''
    };
    
    constructor(props) {
      super(props);
      this.state = {
        cardAccount: this.emptyCardAccount,
        payee: this.props.location.state.payee,
        pwResponse: this.emptyResponse,
        isLoading: true
      };
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
    
    async componentDidMount() {
      if (this.state.payee.amount > 0) {
          const pwResponse = await (await fetch(
              "pwbillpayments/CreditCard?amount="+this.state.payee.amount
          )).json();
          this.setState({ pwResponse: pwResponse, isLoading: false });
      }
    }

    handleChange(event) {
      const target = event.target;
      const value = target.value;
      const name = target.name;
      let cardAccount = { ...this.state.cardAccount };
      cardAccount[name] = value;
      
      this.setState({ cardAccount : cardAccount });
    }
  
    async handleSubmit(event) {
      event.preventDefault();
      const request = {
        'request' : 'sendQueuedTransaction',
        'paywayRequestToken': this.state.pwResponse.paywayRequestToken,
        'transactionName': this.state.pwResponse.transactionName,
        'transactionSourceId': this.state.pwResponse.idSource,
        'accountInputMode' : 'primaryAccountNumber',
        'cardAccount' : this.state.cardAccount
      };
  
      let response = await fetch("https://devedgilpayway.net/PaywayWS/Payment/CreditCard", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
      });
      this.props.history.push({
        pathname: "/groups",
        state: {response: response}
      });
    }
  
  
    render() {
      if(this.state.isLoading) return null;

      const { cardAccount } = this.state; 
      const title = <h2>"PaywayWS Credit Card User Experience"</h2>;
  
      return (
        <div>
          <AppNavbar />
          <Container>
            {title}
            <Form onSubmit={this.handleSubmit}>
              <FormGroup>
                <Label for="accountNumber">Credit Card number</Label>
                <Input
                  type="text"
                  name="accountNumber"
                  id="accountNumber"
                  value={cardAccount.accountNumber || ""}
                  onChange={this.handleChange}
                  autoComplete="accountNumber"
                />
              </FormGroup>
              <FormGroup>
                <Label for="expirationDate">Expiration Date</Label>
                <Input
                  type="text"
                  name="expirationDate"
                  id="expirationDate"
                  value={cardAccount.expirationDate || ""}
                  onChange={this.handleChange}
                  autoComplete="expirationDate"
                />
              </FormGroup>
              <FormGroup>
                <Label for="fsv">Security Code</Label>
                <Input
                  type="text"
                  name="fsv"
                  id="fsv"
                  value={cardAccount.fsv || ""}
                  onChange={this.handleChange}
                  autoComplete="fsv"
                />
              </FormGroup>
              <FormGroup>
                <Label for="zip">Zip code</Label>
                <Input
                  type="text"
                  name="zip"
                  id="zip"
                  value={cardAccount.zip || ""}
                  onChange={this.handleChange}
                  autoComplete="zip"
                />
              </FormGroup>
              <FormGroup>
                <Button color="primary" type="submit">
                  Submit
                </Button>{" "}
                <Button color="secondary" tag={Link} to="/groups">
                  Cancel
                </Button>
              </FormGroup>
            </Form>
          </Container>
        </div>
      );
    }    
}

export default withRouter(PWCCSetup);