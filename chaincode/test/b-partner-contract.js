/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { BPartnerContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('BPartnerContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new BPartnerContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"b partner 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"b partner 1002 value"}'));
    });

    describe('#bPartnerExists', () => {

        it('should return true for a b partner', async () => {
            await contract.bPartnerExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a b partner that does not exist', async () => {
            await contract.bPartnerExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createBPartner', () => {

        it('should create a b partner', async () => {
            await contract.createBPartner(ctx, '1003', 'b partner 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"b partner 1003 value"}'));
        });

        it('should throw an error for a b partner that already exists', async () => {
            await contract.createBPartner(ctx, '1001', 'myvalue').should.be.rejectedWith(/The b partner 1001 already exists/);
        });

    });

    describe('#readBPartner', () => {

        it('should return a b partner', async () => {
            await contract.readBPartner(ctx, '1001').should.eventually.deep.equal({ value: 'b partner 1001 value' });
        });

        it('should throw an error for a b partner that does not exist', async () => {
            await contract.readBPartner(ctx, '1003').should.be.rejectedWith(/The b partner 1003 does not exist/);
        });

    });

    describe('#updateBPartner', () => {

        it('should update a b partner', async () => {
            await contract.updateBPartner(ctx, '1001', 'b partner 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"b partner 1001 new value"}'));
        });

        it('should throw an error for a b partner that does not exist', async () => {
            await contract.updateBPartner(ctx, '1003', 'b partner 1003 new value').should.be.rejectedWith(/The b partner 1003 does not exist/);
        });

    });

    describe('#deleteBPartner', () => {

        it('should delete a b partner', async () => {
            await contract.deleteBPartner(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a b partner that does not exist', async () => {
            await contract.deleteBPartner(ctx, '1003').should.be.rejectedWith(/The b partner 1003 does not exist/);
        });

    });

});
