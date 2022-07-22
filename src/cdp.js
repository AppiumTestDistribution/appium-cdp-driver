import { client } from "taiko";

export async function getNetwork(){
    const cdpClient = await client();
    const Network = cdpClient.Network;
    await Network.enable();
    return Network;
}

