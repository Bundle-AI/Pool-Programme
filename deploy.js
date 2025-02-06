const anchor = require('@project-serum/anchor');
const fs = require('fs');

const provider = anchor.Provider.local();
anchor.setProvider(provider);

const program = anchor.workspace.FundPool;
const programKeypair = anchor.web3.Keypair.generate();

async function deploy() {
  await program.rpc.deploy({
    accounts: {
      program: programKeypair.publicKey,
    },
    signers: [programKeypair],
  });
  console.log('Program deployed:', programKeypair.publicKey.toString());
}

deploy();
