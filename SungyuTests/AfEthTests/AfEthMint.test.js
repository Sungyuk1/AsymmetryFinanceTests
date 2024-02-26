//import { ethers, network, upgrades } from "hardhat";
const { ethers, network, upgrades } = require("hardhat");
//import { expect } from "chai";
const { expect } = require("chai");

//import { MULTI_SIG, RETH_DERIVATIVE, WST_DERIVATIVE } from "../../test/constants";
const { MULTI_SIG, RETH_DERIVATIVE, WST_DERIVATIVE } = require("../../test/constants");

//import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

function delay(milliseconds){
  return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
  });
}

describe("Test AfEth", async function () {


    //reset mainnet to certain block for testing
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

        it("Should mint", async function () {
            const depositAmount = ethers.utils.parseEther("1");
            await delay(300);
            const mintTx = await afEth.deposit(0, { value: depositAmount });
            await delay(300);
            await mintTx.wait();
            await delay(300);

            const afEthBalanceBeforeRequest = await afEth.balanceOf(
                accounts[0].address
              );
            await delay(300);
            expect(afEthBalanceBeforeRequest).gt(0);

        })




})