
import assert from 'assert'
import { request } from 'needle'

import * as WalletServer from '../lib/index'


export function networkTests() {
  console.debug('networkTests()')

  WalletServer.GetPeers().then(r => {
    console.debug('GetPeers()', r)
    assert.ifError(r.error)
  })
  
  // await WalletServer.Stop().then(r => {
  //   console.debug('Stop()', r)
  //   assert.ifError(r.error)
  // })

}
