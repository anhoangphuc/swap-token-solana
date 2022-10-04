import { Keypair } from "@solana/web3.js";
import {getAccounts, getContracts, saveAccount} from "./utils";
import bs58 from "bs58";

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