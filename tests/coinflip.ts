import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { Coinflip } from "../target/types/coinflip";

describe("coinflip", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.coinflip as Program<Coinflip>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
