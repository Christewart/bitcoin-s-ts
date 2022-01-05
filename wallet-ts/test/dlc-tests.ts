
import assert from 'assert'
import { request } from 'needle'

import * as WalletServer from '../lib/index'


export function dlcTests() {
  console.debug('dlcTests()')

  WalletServer.GetDLCHostAddress().then(r => {
    console.debug('GetDLCHostAddress()', r)
    assert.ifError(r.error)
  })
  
}
