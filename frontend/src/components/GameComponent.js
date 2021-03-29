import {withCookies} from "react-cookie";
import {withRouter} from "react-router-dom";
import React from "react";
import {connect} from "react-redux";

class GameComponent extends React.Component {
    state = {
        errorMessage: "",

        username: "",

        //TODO: players and bots lists, or combine into one?
        players: [],

        currentPlayer: "",
        diceCounts: [],
        hand: [],

        //TODO: how are we storing bid?
        // [count, quantity]? two separate variables? custom class/struct?
        currentBid: "",
        bidOwner: ""
    }

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{height: '500px'}}>
                <p>Game Component</p>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {dispatch}
}

const mapStateToProps = state => {
    return {
        socket: state.socket,
    }
}

export default connect(mapDispatchToProps, mapStateToProps)(withCookies(withRouter(GameComponent)))