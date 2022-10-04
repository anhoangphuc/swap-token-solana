import {clusterApiUrl, Connection} from "@solana/web3.js";

export async function getConnection(): Promise<Connection> {
    const network = process.env.NETWORK;
    const commitment = 'confirmed';
    let connection: Connection;
    if (['devnet', 'testnet', 'mainnet-beta'].indexOf(network) >= 0) {
        connection = new Connection(clusterApiUrl(network as any), commitment)
    } else if (network === 'local') {
        connection = new Connection('http://127.0.0.1:8899', commitment);
    } else {
        throw Error(`Network config errored ${network}`);
    }
    return connection;
}