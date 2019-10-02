import React, { Component } from "react";
import { Button, ButtonGroup } from "reactstrap";
import { Link } from "react-router-dom";

class GroupRow extends Component {
    constructor(props) {
    super(props);
    this.state = { payee: this.props.payee };
    this.remove = this.remove.bind(this);
    // this.handleToCC = this.handleToCC.bind(this);
    // this.handleToApple = this.handleToApple.bind(this);
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
        
        this.setState({payee: payee});
    }

    render(){
        const {payee}=this.state;
        return (
            <tr>
                <td style={{ whiteSpace: "nowrap" }}>{payee.name}</td>
                <td>{payee.address}</td>
                <td>{payee.account}</td>
                <td>
                    <input type="number" name="amount" id="amount" value={payee.amount || ''} onChange={(e)=>this.handleChange(e)} />
                </td>
                <td>
                <ButtonGroup>
                    <Button
                    size="sm"
                    color="primary"
                    onClick={()=>{this.props.history.push({
                        pathname: `/creditcard`,
                        state:{payee: payee} 
                    });}}
                    >
                    Credit Card
                    </Button>
                    <Button
                    size="sm"
                    color="danger"
                    onClick={()=>{this.props.history.push({
                        pathname: `/applepay`,
                        state:{payee: payee} 
                    });}}
                    >
                    Apple pay
                    </Button>
                </ButtonGroup>
                </td>
                <td>
                <ButtonGroup>
                <Button size="sm" color="primary" tag={Link} to={"/groups/" + payee.id}>Edit</Button>
                <Button size="sm" color="danger" onClick={() => this.remove(payee.id)}>Delete</Button>
                </ButtonGroup>
                </td>
            </tr>);
    }
}
export default GroupRow;