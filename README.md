# AfEth Invitational audit details
- Total Prize Pool: $31,310 USDC 
  - HM awards: $18,252 USDC 
  - Analysis awards: $1,014 USDC 
  - QA awards: $507 USDC 
  - Bot Race awards: $0 USDC 
  - Gas awards: $507 USDC 
  - Judge awards: $3,380 USDC 
  - Lookout awards: $0 USDC 
  - Scout awards: $500 USDC 
  - Mitigation Review: $7,150 USDC (*Opportunity goes to top 3 certified wardens based on placement in this audit.*)
- Join [C4 Discord](https://discord.gg/code4rena) to register
- Submit findings [using the C4 form](https://code4rena.com/contests/2023-09-asymmetry-finance-afeth-invitational/submit)
- [Read our guidelines for more details](https://docs.code4rena.com/roles/wardens)
- Starts September 20, 2023 20:00 UTC 
- Ends September 27, 2023 20:00 UTC 

## Automated Findings / Publicly Known Issues

Automated findings output for the audit can be found [here](https://github.com/code-423n4/2023-09-asymmetry/bot-report.md) within 24 hours of audit opening.

*Note for C4 wardens: Anything included in the automated findings output is considered a publicly known issue and is ineligible for awards.*

[ ⭐️ SPONSORS: Are there any known issues or risks deemed acceptable that shouldn't lead to a valid finding? If so, list them here. ]


# Overview

## About

AfEth is an ERC20 token collateralized by 2 underlying "strategy" tokens in an adjustable ratio. AfEth can be thought of as a "manager" that collateralizes the 2 tokens into a new token. (see [AbstractErc20Strategy.sol](https://github.com/asymmetryfinance/afeth/blob/main/contracts/strategies/AbstractErc20Strategy.sol))

### Token 1, safEth:

- [safeth](https://etherscan.io/token/0x6732efaf6f39926346bef8b821a04b6361c4f3e5) is our flagship liquid staking token consisting of 6 underling lsds ([Lido](https://lido.fi/), [rocketpool](https://rocketpool.net/), [staked frax](https://docs.frax.finance/frax-ether/overview), etc...). It is a simple "price go up" token with immediate liquidity via its "stake" and "unstake" functions. 

### Token 2, votium strategy:

- The votium strategy utilizes [votium](https://votium.app/) incentives in the [convex finance](https://www.convexfinance.com/) ecosystem in order to make a token whos price only goes up in relation to [convex token](https://etherscan.io/token/0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b)'s price (in eth).

- To mint votium strategy tokens, convex tokens are purchased, locked in the [vote locked cvx contract](https://etherscan.io/address/0x72a19342e8F1838460eBFCCEf09F6585e32db86E), and [delegated to votium](https://docs.votium.app/explainers/voter-manual), and strategy tokens are minted at the current strategy token price in votium  [cvxPerVotium()](https://github.com/asymmetryfinance/afeth/blob/main/contracts/strategies/votiumErc20/VotiumErc20StrategyCore.sol#L145C14-L145C26).

- Votium rewards are claimed with [claimRewards()](https://github.com/asymmetryfinance/afeth/blob/main/contracts/strategies/votiumErc20/VotiumErc20StrategyCore.sol#L192) using merkle proofs [published by votium](https://github.com/oo-00/Votium/tree/main/merkle) every 2 weeks. [applyRewards()](https://github.com/asymmetryfinance/afeth/blob/main/contracts/strategies/votiumErc20/VotiumErc20StrategyCore.sol#L272) sells rewards on 0x and deposits them back into afEth (and ultimately back into the safEth & votium strategies), making the afEth price go up.

- There is an unlock period to withdraw (up to 16 weeks) because votium strategy tokens are collateralized by many different vote locked convex positions. [requestWithdraw()](https://github.com/asymmetryfinance/afeth/blob/main/contracts/strategies/votiumErc20/VotiumErc20Strategy.sol#L54) burns the strategy tokens, calculates how much cvx they is owed based on cvxPerVotium() price, marks this amount to be unlocked on subsequent calls to [processExpiredLocks()](https://github.com/asymmetryfinance/afeth/blob/main/contracts/strategies/votiumErc20/VotiumErc20Strategy.sol#L145C39-L145C48), calculates unlock time and returns withdrawId to later be used in [withdraw()](https://github.com/asymmetryfinance/afeth/blob/main/contracts/strategies/votiumErc20/VotiumErc20Strategy.sol#L108).

### AfEth

- When minting, afEth purchases each underlying strategy token (safEth & votium strategy) according to [ratio](https://github.com/asymmetryfinance/afeth/blob/main/contracts/AfEth.sol#L12).

- [depositRewards()](https://github.com/asymmetryfinance/afeth/blob/main/contracts/AfEth.sol#L306C14-L306C23) is called by the votium strategy upon claiming rewards to make the afEth price go up by distributing funds into both strategies according to ratio.

- `requestWithdraw()` is called to calculate how much time is required to unlock all underlying vote locked convex before the user can call `withdraw()`.

### A note about varying unlock times

- When a user calls requestWithdraw() the contract
looks at who has requested to withdraw before them, calculates the date at which enough vlcvx can be unlocked to close their position along with everyone in front of them, and marks that amount of convex to be unlocked asap.

- Because of this, the withdraw time will be contantly changing for users that havent called requestWithdraw(). This could cause users to "race" to enter the unlock queue under certain unqiue market conditions.

- While this isnt ideal, we do not believe it to be exploitable in a harmful way because the maximum unlock time is 16 weeks regardless of state of the unlock queue.


## Local Development

To use the correct node version run

```
nvm use
```

To install dependencies and compile run

```
yarn && yarn compile
```

## Testing

`yarn test` to run test suite.

## Architecture Diagrams

Coming soon

## Links

- **Previous audits:** 
- **Documentation:**
- **Website:**
- **Twitter:** 
- **Discord:** 


# Scope

  - [ ] In the table format shown below, provide the name of each contract and:
  - [ ] source lines of code (excluding blank lines and comments) in each *For line of code counts, we recommend running prettier with a 100-character line length, and using [cloc](https://github.com/AlDanial/cloc).* 
  - [ ] external contracts called in each
  - [ ] libraries used in each

*List all files in scope in the table below (along with hyperlinks) -- and feel free to add notes here to emphasize areas of focus.*

| Contract | SLOC | Purpose | Libraries used |  
| ----------- | ----------- | ----------- | ----------- |
| [contracts/AfEth.sol](contracts/AfEth.sol) | 260 | This contract is the main point of entry into the protocol| [`@openzeppelin/*`](https://openzeppelin.com/contracts/) |
| [contracts/strategies/AbstractStrategy.sol](contracts/strategies/AbstractStrategy.sol) | 31 | This is an abstract contract for strategies (there's only one strategy for now)| [`@openzeppelin/*`](https://openzeppelin.com/contracts/) |
| [contracts/strategies/votium/VotiumStrategyCore.sol](contracts/strategies/votium/VotiumStrategyCore.sol) | 308 | This is the base contract for the votium strategy | [`@openzeppelin/*`](https://openzeppelin.com/contracts/) |
| [contracts/strategies/votium/VotiumStrategy.sol](contracts/strategies/votium/VotiumStrategy.sol) | 174 | This is the main contract for the votium strategy that inherits AbstractStrategy | [`@openzeppelin/*`](https://openzeppelin.com/contracts/) |

## Out of scope

*List any files/contracts that are out of scope for this audit.*

# Additional Context

- [ ] Describe any novel or unique curve logic or mathematical models implemented in the contracts
- [ ] Please list specific ERC20 that your protocol is anticipated to interact with. Could be "any" (literally anything, fee on transfer tokens, ERC777 tokens and so forth) or a list of tokens you envision using on launch.
- [ ] Please list specific ERC721 that your protocol is anticipated to interact with.
- [ ] Which blockchains will this code be deployed to, and are considered in scope for this audit?
- [ ] Please list all trusted roles (e.g. operators, slashers, pausers, etc.) and any conditions under which privilege escalation is expected/allowable
- [ ] In the event of a DOS, could you outline a minimum duration after which you would consider a finding to be valid? This question is asked in the context of most systems' capacity to handle DoS attacks gracefully for a certain period.
- [ ] Is any part of your implementation intended to conform to any EIP's? If yes, please list the contracts in this format: 
  - `Contract1`: Should comply with `ERC/EIPX`
  - `Contract2`: Should comply with `ERC/EIPY`

## Attack ideas (Where to look for bugs)
*List specific areas to address - see [this blog post](https://medium.com/code4rena/the-security-council-elections-within-the-arbitrum-dao-a-comprehensive-guide-aa6d001aae60#9adb) for an example*
### Access Control
AfEth is the main point of entry, but people could directly deposit to votium, the problem would be their rewards get spread into the manager.  We want to mak sure there's no vulnerabilities here.

### Votium Contract
We are heavily integrated with votium and want to make sure there's no potential for funds being locked inside the votium business logic

### Full Lifecycle Analysis
This is the first audit for this protocol so it needs to be heavily audited

## Main invariants
Users will not lose money (outside of normal gas/slippage costs)
Users will gain rewards 
Funds cannot be permanently locked

## Scoping Details 

```
- If you have a public code repo, please share it here:  
- How many contracts are in scope?: 5
- Total SLoC for these contracts?: 693
- How many external imports are there?: 11
- How many separate interfaces and struct definitions are there for the contracts within scope?: 13
- Does most of your code generally use composition or inheritance?: Inheritance
- How many external calls?: 6
- What is the overall line coverage percentage provided by your tests?: 90%
- Is this an upgrade of an existing system?: False
- Check all that apply (e.g. timelock, NFT, AMM, ERC20, rollups, etc.): Timelock function, ERC-20 Token
- Is there a need to understand a separate part of the codebase / get context in order to audit this part of the protocol?:   False
- Please describe required context:   N/A
- Does it use an oracle?:  Chainlink
- Describe any novel or unique curve logic or mathematical models your code uses: We have a manager contract that interacts with strategies.  We are launching with two strategies and one is SafEth and another is interacting with Votium
- Is this either a fork of or an alternate implementation of another project?:   False
- Does it use a side-chain?: False
- Describe any specific areas you would like addressed: We want to make sure the rewards received through each of the strategies are evenly distributed to each user.  The votium strategy is the one that probably needs the most focus as the safEth strategy is fairly simple.  This is fresh code so everything needs to be audited
```

# Tests

*Provide every step required to build the project from a fresh git clone, as well as steps to run the tests with a gas report.* 

*Note: Many wardens run Slither as a first pass for testing.  Please document any known errors with no workaround.* 
