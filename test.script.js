const anchor = require('@project-serum/anchor');
const { PublicKey, SystemProgram } = anchor.web3;

describe('fund-pool', () => {
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);
  const program = anchor.workspace.FundPool;
  const fundPoolAccount = anchor.web3.Keypair.generate();
  const admin = provider.wallet;

  it('Initializes the fund pool', async () => {
    await program.rpc.initialize({
      accounts: {
        fundPool: fundPoolAccount.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      },
      signers: [fundPoolAccount],
    });

    const pool = await program.account.fundPool.fetch(fundPoolAccount.publicKey);
    assert.equal(pool.admin.toString(), admin.publicKey.toString());
    assert.equal(pool.totalFunds.toNumber(), 0);
    assert.equal(pool.userShares.length, 0);
  });

  it('Deposits funds into the pool', async () => {
    const depositAmount = 1000;
    await program.rpc.deposit(new anchor.BN(depositAmount), {
      accounts: {
        fundPool: fundPoolAccount.publicKey,
        user: admin.publicKey,
      },
    });

    const pool = await program.account.fundPool.fetch(fundPoolAccount.publicKey);
    assert.equal(pool.totalFunds.toNumber(), depositAmount);
    assert.equal(pool.userShares.length, 1);
    assert.equal(pool.userShares[0][0].toString(), admin.publicKey.toString());
    assert.equal(pool.userShares[0][1].toNumber(), depositAmount);
  });

  it('Withdraws profits from the pool', async () => {
    await program.rpc.withdraw({
      accounts: {
        fundPool: fundPoolAccount.publicKey,
        admin: admin.publicKey,
      },
    });

    const pool = await program.account.fundPool.fetch(fundPoolAccount.publicKey);
    assert.equal(pool.totalFunds.toNumber(), 0);
    assert.equal(pool.userShares.length, 1);
  });
});
