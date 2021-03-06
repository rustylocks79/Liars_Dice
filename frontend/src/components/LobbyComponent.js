import {withCookies} from "react-cookie";
import {withRouter} from "react-router-dom";
import React from "react";
import {Button, Container, FormControl, Grid, MenuItem, Select} from "@material-ui/core";
import TopBarComponent from "./TopBarComponent";
import {connect} from "react-redux";
import AuthService from "../Services/AuthService";


//Reference for layout: https://stackoverflow.com/questions/50766693/how-to-center-a-component-in-material-ui-and-make-it-responsive

//Reference for clicking + and - on number of dice: https://medium.com/@aghh1504/2-increment-and-decrease-number-onclick-react-5767b765103c

//Rendering array in React.js: https://www.youtube.com/watch?v=ke1pkMV44iU
class LobbyComponent extends React.Component {
    state = {
        jwtToken: "",
        username: "",
        errorMessage: "",
        numDice: 0,
        host: '',
        players: [],
    }

    constructor(props) {
        super(props);
        const {cookies} = props;
        this.state.jwtToken = cookies.get('JWT-TOKEN')

        //redux stuff
        this.state.players = this.props.playersStore
        this.state.numDice = this.props.numDiceStore
        this.state.host = this.props.hostStore

        this.props.socket.on('joined_game', data => {
            console.log('received event joined_game from server: ' + JSON.stringify(data))
            this.setState({
                players: data.players,
                numDice: data.numDice,
                errorMessage: ""
            })
        })
        this.props.socket.on('updated_game', data => {
            console.log('received event updated_game from server: ' + JSON.stringify(data))
            this.setState({
                numDice: data.numDice,
                errorMessage: ""
            })
        })
        this.props.socket.on('updated_bots', data => {
            console.log('received event updated_game from server: ' + JSON.stringify(data))
            this.setState({
                players: data.players,
                errorMessage: ""
            })
        })
        this.props.socket.on('left_game', data => {
            console.log('received event left_game from server: ' + JSON.stringify(data))
            this.setState({
                players: data.players,
                host: data.host
            })
            if (data.lostPlayer === this.state.username) {
                this.props.history.push('/game/welcome')
            }
            this.setState({errorMessage: ""})
        })
        this.props.socket.on('started_game', data => {
            console.log('received event started_game from server: ' + JSON.stringify(data))
            this.props.dispatch({
                type: 'START_GAME',
                payload: {
                    index: data.index,
                    activeDice: data.activeDice,
                    currentPlayer: data.currentPlayer,
                    players: data.players,
                    hand: data.hand
                }
            })
            this.setState({errorMessage: ""})
            this.props.history.push('/game/play')
        })
        this.props.socket.on('error', data => {
            console.log('received event error from server ' + JSON.stringify(data))
            this.setState({errorMessage: data['reason']})
        })
    }

    componentDidMount() {
        AuthService.user(this.state.jwtToken).then((res) => {
            this.setState({username: res.data.username})
        })
    }

    onStartGame = (event) => {
        this.props.socket.emit('start_game', {
            lobbyId: this.props.lobbyId,
            jwtToken: this.state.jwtToken
        });
    }

    onLeaveGame = (event) => {
        this.props.socket.emit('leave_game', {
            lobbyId: this.props.lobbyId,
            jwtToken: this.state.jwtToken
        })
    }

    updateGame = (numDice) => {
        this.props.socket.emit('update_game', {
            lobbyId: this.props.lobbyId,
            jwtToken: this.state.jwtToken,
            numDice: numDice
        })
    }

    incrementDie = () => {
        this.updateGame(Math.min((this.state.numDice + 1), 5), this.state.bots)
    }

    decreaseDie = () => {
        this.updateGame(Math.max((this.state.numDice - 1), 1), this.state.bots)
    }

    addBot = () => {
        this.props.socket.emit('add_bot', {
            lobbyId: this.props.lobbyId,
            jwtToken: this.state.jwtToken
        })
    }

    removeBot = (name) => {
        this.props.socket.emit('delete_bot', {
            lobbyId: this.props.lobbyId,
            jwtToken: this.state.jwtToken,
            username: name
        })
    }

    clearBots = () => {
        this.props.socket.emit('clear_bots', {
            lobbyId: this.props.lobbyId,
            jwtToken: this.state.jwtToken
        })
    }

    changeLevel = (event) => {
        this.props.socket.emit('update_level', {
            lobbyId: this.props.lobbyId,
            jwtToken: this.state.jwtToken,
            username: event.target.name,
            level: event.target.value
        })
    }

    displayPlayers = () => {
        return (
            <div style={{textAlign: "left"}}>
                {this.state.players.map(player => (
                    <div key={player.username} style={{marginBottom: "10px"}}>
                        {(player.bot && this.state.username === this.state.host) &&
                        <div style={{display: "inline", marginLeft: "10px"}}>
                            <button onClick={() => this.removeBot(player.username)}
                                    style={{marginRight: "10px", verticalAlign: "middle"}}>X
                            </button>
                            <FormControl style={{marginLeft: "10px", marginRight: "10px", verticalAlign: "middle"}}>
                                <Select style={{width: "100px"}}
                                        value={player.level}
                                        name={player.username}
                                        onChange={this.changeLevel}
                                >
                                    <MenuItem value={"Easy"}>Easy</MenuItem>
                                    <MenuItem value={"Medium"}>Medium</MenuItem>
                                    <MenuItem value={"Hard"}>Hard</MenuItem>
                                </Select>
                            </FormControl>
                            <span style={{
                                color: player.color,
                            }}>{player.username}</span>
                        </div>
                        }


                        {player.username === this.state.host && <div style={{textAlign: "center"}}>
                            <p style={{
                                color: player.color,
                                fontWeight: "bold",
                                display: "inline"
                            }}>{player.username} <p
                                style={{color: "black", marginLeft: "10px", display: "inline"}}>[host]</p></p>
                        </div>}

                        {player.username !== this.state.host && !player.bot && <div style={{textAlign: "center"}}><p
                            style={{
                                color: player.color,
                                display: "inline",
                                verticalAlign: "middle"
                            }}>{player.username}</p></div>}

                        {this.state.username !== this.state.host && player.bot && <div style={{textAlign: "center"}}>
                            <p style={{
                                color: player.color,
                                display: "inline",
                                verticalAlign: "middle"
                            }}>{player.username}</p>
                            <p style={{
                                display: "inline",
                                marginLeft: "10px",
                                verticalAlign: "middle"
                            }}>[{player.level} Bot]</p>
                        </div>}


                    </div>
                ))}
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.state.errorMessage && <h1>{this.state.errorMessage}</h1>}
                <TopBarComponent/>
                <h2 align={"center"}>Lobby #{this.props.lobbyId}</h2>

                <Container>
                    <Grid container>
                        <Grid item xs={7} container
                              spacing={0}
                              direction="column"
                              alignItems="center"
                              justify="flex-start"
                              style={{minHeight: '10vh'}}
                        >
                            <h4>Players</h4>
                            {this.displayPlayers()}

                            {this.state.username === this.state.host &&
                            <div>
                                <br/>
                                <Button onClick={this.clearBots} variant="contained" color="default" size="small">
                                    Clear Bots
                                </Button>
                                <Button onClick={this.addBot} variant="contained" color="secondary" size="small"
                                        style={{marginLeft: "10px"}}>
                                    Add Bot
                                </Button>
                            </div>
                            }

                        </Grid>
                        <Grid item xs={2} container
                              spacing={0}
                              direction="column"
                              alignItems="center"
                              justify="flex-start"
                              style={{minHeight: '10vh'}}
                        >
                            <h4>Number of Dice</h4>

                            {this.state.username === this.state.host &&
                            <Button variant={"contained"} size="small" onClick={this.incrementDie}>
                                +
                            </Button>
                            }

                            <h3>{this.state.numDice}</h3>

                            {this.state.username === this.state.host &&
                            <Button variant={"contained"} size="small" onClick={this.decreaseDie}>
                                -
                            </Button>
                            }
                        </Grid>
                    </Grid>

                </Container>

                <br/>

                <div align={"center"}>
                    <Button variant="contained" color="default" onClick={this.onLeaveGame}>
                        Leave Lobby
                    </Button>
                    {this.state.username === this.state.host &&
                    <Button variant="contained" color="primary" onClick={this.onStartGame} style={{marginLeft: "10px"}}>
                        Start Game
                    </Button>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        lobbyId: state.lobbyId,
        socket: state.socket,
        playersStore: state.players,
        numDiceStore: state.numDice,
        hostStore: state.host
    }
}

export default connect(mapStateToProps)(withCookies(withRouter(LobbyComponent)))