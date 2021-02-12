from pycfr import Game
import random as rand


class LiarsDice (Game):

    # TODO: add variable num_active_players???
    # TODO: flag players as active/inactive
    # TODO: fix the utility method
    # TODO: update last player to account for nonactive players

    def __init__(self, num_players, num_dice):
        self.hands = [[0 for i in range(num_dice)] for i in range(num_players)]
        self.create_hands()
        self.bid_history = []
        self.active_player = 0
        self.num_players = num_players
        self.active = [True for i in range(num_players)]

    def create_hands(self):
        for hand in self.hands:
            for i in range(len(hand)):
                hand[i] = rand.randint(1, 6)

    def is_terminal(self) -> bool:
        return sum(self.active) == 1

    def utility(self, player: int) -> float:
        if not self.active[player]:
            return 0
        return len(self.hands[player])

    # ignore
    def info_set(self) -> str:
        return super().info_set()

    def actions(self) -> list:
        # check bid history before doubt
        # raise: all possible bids (either increase face value keeping quantity or increase quantity w/ any face value)
        # list all actions up to quantity + 1
        # example: assume bid history has value already and latest bid was 2 4s
        #     expect result of that to be doubt raise 2 5's, 2 6's, or raise 3 2's, 3 3's, ... , 3 6's
        # actions: ("doubt") or ("raise", quantity, face value)
        if len(self.bid_history) == 0:
            return [("raise", 1, i) for i in range(2, 7)]
        bid = self.bid_history[-1]
        last_quantity = bid[1]
        last_face = bid[2]
        actions = []
        if len(self.bid_history) != 0:
            actions.append(("doubt",))
        for face in range(last_face + 1, 7):
            actions.append(("raise", last_quantity, face))
        for face in range(2, 7):
            actions.append(("raise", last_quantity + 1, face))
        return actions

    def perform(self, action) -> None:
        # update active player
        # update bid history
        if not self.bid_history:
            if action[0] == "doubt":
                raise RuntimeError("Invalid action: cannot doubt on first bid")
            elif action[1] < 1:
                raise RuntimeError("Invalid action: quantity must be positive")
            elif not 2 <= action[2] <= 6:
                raise RuntimeError("Invalid action: face value must be between 2 and 6")
            else:
                self.bid_history.append(action)
        else:
            bid = self.bid_history[-1]
            last_quantity = bid[1]
            last_face = bid[2]

            if action == ("doubt",):
                quantity_on_board = 0
                for hand in self.hands:
                    for face in hand:
                        if face == last_face:
                            quantity_on_board += 1
                if last_quantity > quantity_on_board:
                    # doubt was correct
                    # remove die from previous bidder's hand
                    #
                    last_player = self.get_last_player()
                    self.hands[last_player].pop()
                    if len(self.hands[last_player]) == 0:
                        self.active[last_player] = False
                else:
                    # doubt was incorrect
                    self.hands[self.active_player].pop()
                    if len(self.hands[self.active_player]) == 0:
                        self.active[self.active_player] = False
                self.create_hands()
            elif action[0] == "raise":
                # raise
                new_quantity = action[1]
                new_face = action[2]
                # if quantity > last or (quantities equal and face is greater)
                if not (new_quantity > last_quantity or (new_quantity == last_quantity and new_face > last_face)):
                    raise RuntimeError("Invalid bid: last bid was {} {}, new bid was {} {}".format(last_quantity, last_face, new_quantity, new_face))
                elif not 2 <= new_face <= 6:
                    raise RuntimeError("Invalid bid: face value must be between 2 and 6")
                else:
                    self.bid_history.append(action)
            else:
                # action is neither raise nor doubt
                raise RuntimeError("Invalid bid: must either raise or doubt")

        self.active_player = self.get_next_active_player()
        super().perform(action)

    def get_last_player(self):
        result = self.active_player - 1
        if result < 0:
            result = self.num_players - 1
        while not self.active[result]:
            result -= 1
            if result < 0:
                result = self.num_players - 1
        return result

    def get_next_active_player(self):
        result = self.active_player + 1
        if result >= self.num_players:
            result = 0
        while not self.active[result]:
            result += 1
            if result >= self.num_players:
                result = 0
        return result

    def reset(self) -> None:
        super().reset()

    def active_player(self) -> int:
        return self.active_player

    def num_players(self) -> int:
        return self.num_players
