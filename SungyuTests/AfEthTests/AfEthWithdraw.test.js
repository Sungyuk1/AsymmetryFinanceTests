const { ethers, network, upgrades } = require("hardhat");
const { expect } = require("chai");

const { MULTI_SIG, RETH_DERIVATIVE, WST_DERIVATIVE } = require("../../test/constants");
const { derivativeAbi } = require("../../test/abis/derivativeAbi");
const { safEthAbi } = require("../../test/abis/safEthAbi");
const { incrementVlcvxEpoch } = require("../../test/strategies/Votium/VotiumTestHelpers");

function delay(milliseconds){
  return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
  });
}

/**
 * AfEth contract is the main point of entry into the protocol
 * 
 * AfEth is an ERC20 token collateralized by 2 underlying "strategy" tokens in an adjustable ratio. 
 * AfEth can be thought of as a "manager" that collateralizes the 2 tokens into a new token. 
 * 
 * AfEth is made up of two tokens, safeth and votium. Votium utalizes votium incentives in the convex finance ecosystem.
 * It utalizes the votium incentives to make a token whos price only goes up in relation to convex token's price in eth. 
 * 
 * Votium rewards are claimed with claimRewards() using merkle proofs published by votium every 2 weeks. 
 * applyRewards() sells rewards on 0x and deposits them back into afEth 
 * (and ultimately back into the safEth & votium strategies), making the afEth price go up.
 * 
 * There is an unlock period to withdraw (up to 16 weeks) because votium strategy tokens are
 *  collateralized by many different vote locked convex positions. requestWithdraw() burns the strategy tokens,
 *  calculates how much cvx they is owed based on cvxPerVotium() price, marks this amount to be unlocked on 
 * subsequent calls to processExpiredLocks(), 
 * calculates unlock time and returns withdrawId to later be used in withdraw().
 * 
 * When a user calls requestWithdraw() the contract looks at who has requested to withdraw before them, calculates the date at which enough vlcvx can be unlocked to close their position along with everyone in front of them, and marks that amount of convex to be unlocked asap.

Because of this, the withdraw time will be contantly changing for users that havent called
requestWithdraw(). This could cause users to "race" to enter the unlock queue under certain unqiue market conditions.

While this isnt ideal, we do not believe it to be exploitable in a harmful way because the maximum unlock time is
 16 weeks regardless of state of the unlock queue.
 * 
 *  

*/

//AfEth is a token made up of two of other tokens
/*
There is a withdrawl wait period because one of the tokens uses votium to get votium rewards. It buys cvx and
locks it to get vecvx for voiting. This means that to withdrawl, you have to wait for the vecvx to be withdrawable
*/
describe("Test AfEth", async function () {

    const initialStake = ethers.utils.parseEther(".1");
    const initialStakeAccount = 11;

    const resetToBlock = async (blockNumber) => {
        await network.provider.request({
          method: "hardhat_reset",
          params: [
            {
              forking: {
                jsonRpcUrl: process.env.MAINNET_URL,
                blockNumber,
              },
            },
          ],
        });
        accounts = await ethers.getSigners();
        await delay(300);
        const afEthFactory = await ethers.getContractFactory("AfEth");
        await delay(300);
        afEth = (await upgrades.deployProxy(afEthFactory, []));
        await delay(300);
        await afEth.deployed();
        await delay(300);

        const votiumFactory = await ethers.getContractFactory("VotiumStrategy");
        await delay(300);
        votiumStrategy = (await upgrades.deployProxy(votiumFactory, [
        accounts[0].address,
        accounts[0].address,
        afEth.address,
        ]));
        await delay(300);
        await votiumStrategy.deployed();
        await delay(300);

        await afEth.setStrategyAddress(votiumStrategy.address);
        await delay(300);
        // mock chainlink feeds so not out of date
        await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [MULTI_SIG],
        });
        await delay(300);

        const chainLinkRethFeedFactory = await ethers.getContractFactory(
        "ChainLinkRethFeedMock"
        );

        const chainLinkWstFeedFactory = await ethers.getContractFactory(
        "ChainLinkWstFeedMock"
        );

        const chainLinkRethFeed = await chainLinkRethFeedFactory.deploy();
        await delay(300);
        const chainLinkWstFeed = await chainLinkWstFeedFactory.deploy();
        await delay(300);

        const multiSigSigner = await ethers.getSigner(MULTI_SIG);

        // mock chainlink feed on derivatives
        const rEthDerivative = new ethers.Contract(
        RETH_DERIVATIVE,
        derivativeAbi,
        accounts[0]
        );
        const multiSigReth = rEthDerivative.connect(multiSigSigner);
        await multiSigReth.setChainlinkFeed(chainLinkRethFeed.address);
        await delay(300);

        const wstEthDerivative = new ethers.Contract(
        WST_DERIVATIVE,
        derivativeAbi,
        accounts[0]
        );

        const multiSigWst = wstEthDerivative.connect(multiSigSigner);
        await delay(300);
        await multiSigWst.setChainlinkFeed(chainLinkWstFeed.address);
        await delay(300);
        // mint some to seed the system so totalSupply is never 0 (prevent price weirdness on withdraw)
        const tx = await afEth.connect(accounts[initialStakeAccount]).deposit(0, {
        value: initialStake,
        });
        await delay(300);
        await tx.wait();

        const chainLinkCvxEthFeedFactory = await ethers.getContractFactory(
        "ChainLinkCvxEthFeedMock"
        );
        const chainLinkCvxEthFeed = await chainLinkCvxEthFeedFactory.deploy();
        await delay(300);
        await chainLinkCvxEthFeed.deployed();
        await delay(300);
        await votiumStrategy.setChainlinkCvxEthFeed(chainLinkCvxEthFeed.address);
        await delay(300);

        safEth = await ethers.getContractAt(
        safEthAbi,
        "0x6732efaf6f39926346bef8b821a04b6361c4f3e5",
        accounts[0]
        );
        await delay(300);

        }

        beforeEach(
            async () => await resetToBlock(parseInt(process.env.BLOCK_NUMBER ?? "0"))
        );

        it("Mint and Withdrawl All", async function () {
          console.log("Starting Mint and Withdrawl All test");
          const depositAmount = ethers.utils.parseEther(".1");
          await delay(300);
          const mintTx = await afEth.deposit(0, { value: depositAmount });
          await delay(300);
          await mintTx.wait();
          await delay(300);

          const afEthBalanceBeforeRequest = await afEth.balanceOf(
              accounts[0].address
            );
          await delay(300);
          
          console.log("This is the balance after minting with .1 ether : " + afEthBalanceBeforeRequest);
          expect(afEthBalanceBeforeRequest).gt(0);
          
          //veCVX can be locked up for up to 16 weeks. So we might need to wait up to 16 weeks
          /*for (let i = 0; i < 17; i++) {
            await incrementVlcvxEpoch();
          }*/
          //increment vlcvx epoch is causing test to fail. Check what it does. 

          await delay(300);
          let account_balance = await afEth.balanceOf(accounts[0].address);
          console.log("This is the balance of the account at the moment : "+ account_balance);

          const requestWithdrawTx = await afEth.requestWithdraw(
            await afEth.balanceOf(accounts[0].address)
          );
          await requestWithdrawTx.wait();
      
          const afEthBalanceAfterRequest = await afEth.balanceOf(accounts[0].address);
          console.log("This is the balance after requesting to withdraw the entire balance of account : "+afEthBalanceAfterRequest);
          expect(afEthBalanceAfterRequest).eq(0);

          for (let i = 0; i < 17; i++) {
            await incrementVlcvxEpoch();
          }
      
          const withdrawId = await afEth.latestWithdrawId();
          const withdrawInfo = await afEth.withdrawIdInfo(withdrawId);
          expect(withdrawInfo.amount).eq(afEthBalanceBeforeRequest);
          expect(withdrawInfo.owner).eq(accounts[0].address);
          expect(afEthBalanceAfterRequest).eq(0);

          const ethBalanceBeforeWithdraw = await ethers.provider.getBalance(
            accounts[0].address
          );
      
          const withdrawTx = await afEth.withdraw(withdrawId, 0);
          await withdrawTx.wait();
      
          const ethBalanceAfterWithdraw = await ethers.provider.getBalance(
            accounts[0].address
          );

          expect(ethBalanceAfterWithdraw).gt(ethBalanceBeforeWithdraw);
          console.log("This is the eth balance after the withdrawl : " + ethBalanceAfterWithdraw);


      })




})