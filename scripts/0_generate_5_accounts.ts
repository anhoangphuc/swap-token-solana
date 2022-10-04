import { Keypair } from "@solana/web3.js";
import {airdropSol, getAccounts, getConnection, getContracts, getKeypair, saveAccount, sleep} from "./utils";
import bs58 from "bs58";
import dotenv from "dotenv";
dotenv.config();

async function generateFiveAccounts() {
    for (let i = 0; i < 5; i++) {
        const keypair = Keypair.generate();
        await saveAccount(keypair, i);
    }
    console.log(`Generate 5 accounts success`);
}

(async function main() {
    await generateFiveAccounts();
})();