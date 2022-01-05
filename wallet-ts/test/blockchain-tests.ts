
import assert from 'assert'
import { request } from 'needle'

import * as WalletServer from '../lib/index'


const blockHash = '00000000280fbd4a11024fe0f29d23363acbc175ad2d388a541cc2fbe3473447'

export function blockchainTests() {
  console.debug('blockchainTests()')

  WalletServer.GetBlockCount().then(r => {
    console.debug('GetBlockCount()', r)
    assert.ifError(r.error)
  })

  WalletServer.GetFilterCount().then(r => {
    console.debug('GetFilterCount()', r)
    assert.ifError(r.error)
  })

  WalletServer.GetFilterHeaderCount().then(r => {
    console.debug('GetFilterHeaderCount()', r)
    assert.ifError(r.error)
  })

  WalletServer.GetBlockHeader(blockHash).then(r => {
    console.debug('GetBlockHeader()', r)
    assert.ifError(r.error)
  })

  WalletServer.GetInfo().then(r => {
    console.debug('GetInfo()', r)
    assert.ifError(r.error)
  })

}
