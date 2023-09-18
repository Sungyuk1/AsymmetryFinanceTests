# ✨ So you want to run an audit

This `README.md` contains a set of checklists for our audit collaboration.

Your audit will use two repos: 
- **an _audit_ repo** (this one), which is used for scoping your audit and for providing information to wardens
- **a _findings_ repo**, where issues are submitted (shared with you after the audit) 

Ultimately, when we launch the audit, this repo will be made public and will contain the smart contracts to be reviewed and all the information needed for audit participants. The findings repo will be made public after the audit report is published and your team has mitigated the identified issues.

Some of the checklists in this doc are for **C4 (🐺)** and some of them are for **you as the audit sponsor (⭐️)**.

---

# Audit setup

## 🐺 C4: Set up repos
- [ ] Create a new private repo named `YYYY-MM-sponsorname` using this repo as a template.
- [ ] Rename this repo to reflect audit date (if applicable)
- [ ] Rename auditt H1 below
- [ ] Update pot sizes
- [ ] Fill in start and end times in audit bullets below
- [ ] Add link to submission form in audit details below
- [ ] Add the information from the scoping form to the "Scoping Details" section at the bottom of this readme.
- [ ] Add matching info to the Code4rena site
- [ ] Add sponsor to this private repo with 'maintain' level access.
- [ ] Send the sponsor contact the url for this repo to follow the instructions below and add contracts here. 
- [ ] Delete this checklist.

# Repo setup

## ⭐️ Sponsor: Add code to this repo

- [ ] Create a PR to this repo with the below changes:
- [ ] Provide a self-contained repository with working commands that will build (at least) all in-scope contracts, and commands that will run tests producing gas reports for the relevant contracts.
- [ ] Make sure your code is thoroughly commented using the [NatSpec format](https://docs.soliditylang.org/en/v0.5.10/natspec-format.html#natspec-format).
- [ ] Please have final versions of contracts and documentation added/updated in this repo **no less than 48 business hours prior to audit start time.**
- [ ] Be prepared for a 🚨code freeze🚨 for the duration of the audit — important because it establishes a level playing field. We want to ensure everyone's looking at the same code, no matter when they look during the audit. (Note: this includes your own repo, since a PR can leak alpha to our wardens!)


---

## ⭐️ Sponsor: Edit this `README.md` file

- [ ] Modify the contents of this `README.md` file. Describe how your code is supposed to work with links to any relevent documentation and any other criteria/details that the C4 Wardens should keep in mind when reviewing. ([Here's a well-constructed example.](https://github.com/code-423n4/2022-08-foundation#readme))
- [ ] Review the Gas award pool amount. This can be adjusted up or down, based on your preference - just flag it for Code4rena staff so we can update the pool totals across all comms channels.
- [ ] Optional / nice to have: pre-record a high-level overview of your protocol (not just specific smart contract functions). This saves wardens a lot of time wading through documentation.
- [ ] [This checklist in Notion](https://code4rena.notion.site/Key-info-for-Code4rena-sponsors-f60764c4c4574bbf8e7a6dbd72cc49b4#0cafa01e6201462e9f78677a39e09746) provides some best practices for Code4rena audits.

## ⭐️ Sponsor: Final touches
- [ ] Review and confirm the details in the section titled "Scoping details" and alert Code4rena staff of any changes.
- [ ] Check that images and other files used in this README have been uploaded to the repo as a file and then linked in the README using absolute path (e.g. `https://github.com/code-423n4/yourrepo-url/filepath.png`)
- [ ] Ensure that *all* links and image/file paths in this README use absolute paths, not relative paths
- [ ] Check that all README information is in markdown format (HTML does not render on Code4rena.com)
- [ ] Remove any part of this template that's not relevant to the final version of the README (e.g. instructions in brackets and italic)
- [ ] Delete this checklist and all text above the line below when you're ready.

---

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

Automated findings output for the audit can be found [here](bot-report.md) within 24 hours of audit opening.

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

[ ⭐️ SPONSORS: add scoping and technical details here ]

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
[ ⭐️ SPONSORS: please confirm/edit the information below. ]

```
- If you have a public code repo, please share it here:  
- How many contracts are in scope?:
- Total SLoC for these contracts?:
- How many external imports are there?:
- How many separate interfaces and struct definitions are there for the contracts within scope?:
- Does most of your code generally use composition or inheritance?:
- How many external calls?:
- What is the overall line coverage percentage provided by your tests?:
- Is this an upgrade of an existing system?:
- Check all that apply (e.g. timelock, NFT, AMM, ERC20, rollups, etc.): 
- Is there a need to understand a separate part of the codebase / get context in order to audit this part of the protocol?:   
- Please describe required context:   
- Does it use an oracle?:  
- Describe any novel or unique curve logic or mathematical models your code uses: 
- Is this either a fork of or an alternate implementation of another project?:   
- Does it use a side-chain?:
- Describe any specific areas you would like addressed:
```

# Tests

*Provide every step required to build the project from a fresh git clone, as well as steps to run the tests with a gas report.* 

*Note: Many wardens run Slither as a first pass for testing.  Please document any known errors with no workaround.* 
