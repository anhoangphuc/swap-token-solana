import {airdropSol, getConnection, getKeypair, sleep} from "../../utils";
import dotenv from "dotenv";

dotenv.config();

async function airdropFiveAccounts() {
    const network = process.env.NETWORK;
    const connection = await getConnection(network);
    for (let i = 0; i < 5; i++) {
        const keypair = await getKeypair(i);
        await airdropSol(keypair, connection);
        await sleep(10000);
    }
    console.log(`Airdrop 5 account success`);
}

(async function main() {
    await airdropFiveAccounts();
})();