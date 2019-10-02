import React, { Component } from "react";
import { Button, Container, Table } from "reactstrap";
import GroupRow from "./GroupRow";
import AppNavbar from "./AppNavbar";
import { Link } from "react-router-dom";

class GroupList extends Component {
  constructor(props) {
    super(props);
    this.state = { groups: [], isLoading: true };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    fetch("api/groups")
      .then(r => r.json())
      .then(d => this.setState({ groups: d, isLoading: false }));
  }

  render() {
    const { groups, isLoading } = this.state;

    if (isLoading) {
      return <p>Loading...</p>;
    }

    const groupList = groups.map(g => {
      return (
        <GroupRow payee={g} history={this.props.history}  key={g.id} />
      );
    });

    return (
      <div>
        <AppNavbar />
        <Container fluid>
          <div className="float-right">
            <Button color="success" tag={Link} to="/groups/new">
              Add Account
            </Button>
          </div>
          <h3>Payway Payments</h3>
          <Table className="mt-4">
            <thead>
              <tr>
                <th width="20%">Name</th>
                <th width="20%">Address</th>
                <th width="10%">Account</th>
                <th width="10%">Amount</th>
                <th width="30%">Payment Methods</th>
                <th width="10%">Account Management</th>
              </tr>
            </thead>
            <tbody>{groupList}</tbody>
          </Table>
        </Container>
      </div>
    );
  }
}

export default GroupList;
