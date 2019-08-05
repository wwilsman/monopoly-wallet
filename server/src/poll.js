const { from: toArray } = Array;

// polls run for a limited time or until all included players have voted
export default class Poll {
  // the current connected players and poll timeout are required
  constructor(players, timeout) {
    // tracks votes for active players
    this.votes = toArray(players.entries())
      .reduce((votes, [player, token]) => (
        token ? votes.set(player, 0) : votes
      ), new Map());

    // the poll timeout
    this.timeout = timeout;
  }

  // starts the poll and resolves when done'
  async run() {
    return new Promise(resolve => {
      let timeout;

      // cleanup timeout, scoped methods, and resolve
      this.resolve = result => {
        clearTimeout(timeout);
        delete this.resolve;
        delete this.reset;
        resolve(result);
      };

      // clear an existing timeout and start a new one
      this.reset = () => {
        clearTimeout(timeout);
        timeout = setTimeout(this.resolve, this.timeout, false);
      };

      // trigger the initial timeout
      this.reset();
    });
  }

  // counts a player's vote in the poll
  vote(player, vote) {
    // only if the poll includes the player
    if (this.votes.has(player)) {
      // count the vote; positive for yes (true), negative for no (false)
      this.votes.set(player, vote ? 1 : -1);

      // total and tally the votes
      let votes = toArray(this.votes.values());
      let total = votes.reduce((t, v) => t += v ? 1 : 0, 0);
      let tally = votes.reduce((t, v) => t += v, 0);

      if (total === votes.length) {
        // when everybody has voted, end the poll with the results
        this.resolve(tally > 0);
      } else {
        // reset the timeout for the next vote
        this.reset();
      }
    }
  }
}
