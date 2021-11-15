import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'

import { AlertType } from '~component/alert/alert.component'
import { MessageService } from '~service/message.service'
import { WalletStateService } from '~service/wallet-state-service'
import { Attestment, ContractInfo, CoreMessageType, DLCContract, DLCMessageType, DLCState, WalletMessageType } from '~type/wallet-server-types'
import { isCancelable, isRefundable, validateHexString } from '~util/utils'
import { getMessageBody } from '~util/wallet-server-util'

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.scss']
})
export class ContractDetailComponent implements OnInit {

  public AlertType = AlertType
  public DLCState = DLCState

  public isCancelable = isCancelable
  public isRefundable = isRefundable

  _dlc!: DLCContract
  get dlc(): DLCContract { return this._dlc }
  @Input() set dlc(e: DLCContract) { this.reset(); this._dlc = e }

  _contractInfo!: ContractInfo
  get contractInfo(): ContractInfo { return this._contractInfo }
  @Input() set contractInfo(e: ContractInfo) { this._contractInfo = e }

  @Output() close: EventEmitter<void> = new EventEmitter()

  // showDeleteSuccess = false

  oracleSignature: string = ''

  private reset() {

  }

  constructor(private translate: TranslateService, private snackBar: MatSnackBar,
    private messsageService: MessageService, private walletStateService: WalletStateService) { }

  ngOnInit(): void {
  }

  onCancelContract() {
    console.debug('onCancelContract()', this.dlc.dlcId)
    this.messsageService.sendMessage(getMessageBody(WalletMessageType.canceldlc, [this.dlc.dlcId])).subscribe(r => {
      // console.debug(' onCancelContract()', r)
      if (r.result) { // "Success"
        // this.showDeleteSuccess = true
        const config: any = { verticalPosition: 'top', duration: 3000 }
        this.snackBar.open(this.translate.instant('contractDetail.cancelContractSuccess'),
          this.translate.instant('action.dismiss'), config)


        // Force update DLC list
        this.walletStateService.refreshDLCStates()
        this.close.next()
      }
    })
  }

  onOracleSignatures() {
    console.debug('onOracleSignatures', this.oracleSignature)
    if (this.oracleSignature) {
      // Keep extra whitespace out of the system
      const os = this.oracleSignature.trim()
      // Validate oracleSignature as hex
      const isValidHex = validateHexString(os)

      if (!isValidHex) {
        console.error('oracleSignature is not valid hex')
        // TODO : Dialog and 
        return
      }

      console.debug('oracleSignature:', os, 'isValidHex:', isValidHex)

      // ExecuteDLCDialog.scala:22
      // OracleAttestmentTLV.fromHex(str.trim)
      this.messsageService.sendMessage(getMessageBody(CoreMessageType.decodeattestments, [os])).subscribe(r => {
        console.debug('decodeattestments', r)

        if (r.result) {
          const attestment: Attestment = r.result
          console.debug('attestment:', attestment)

          const sigs = [os] // attestment.signatures // 
          // const contractInfoHex = this.dlc.contractInfo
          const contractId = this.dlc.contractId
          const noBroadcast = false // Could allow changing

          // error: "requirement failed: Length specified was BigSizeUInt(169) but not enough bytes in ByteVector(62 bytes, 0x2a821927337b40a30e152052482f894ff8ecfe3f5a1aa4aa3b6720bf7a2db1cb5a846c809f79d9e8d43164b992fe18dfdecc7092ce917d48b015fef7b759)"

          // Assuming attestment.signatures issue...

          this.messsageService.sendMessage(getMessageBody(WalletMessageType.executedlc, 
            [contractId, sigs, noBroadcast])).subscribe(r => {
            console.debug('executedlc', r)
    
            if (r.result) { // closingTxId?
              // This contract will change state and having closingTxId now, needs reloaded
    
              // Force update DLC list
              // this.walletStateService.refreshDLCStates()
    
              // Update just this item?
              this.walletStateService.refreshDLCState(this.dlc)
            }
          })
        }
      })
    } // eo if (this.oracleSignature)
  }

  onReloadContract() {
    console.debug('onReloadContract()')
    this.walletStateService.refreshDLCState(this.dlc)
  }

  onRefund() {
    console.debug('onRefund()')

    const contractId = this.dlc.contractId
    const noBroadcast = false;

    this.messsageService.sendMessage(getMessageBody(WalletMessageType.executedlcrefund, [contractId, noBroadcast])).subscribe(r => {
      console.debug('executedlcrefund', r)

      if (r.result) {
        this.walletStateService.refreshDLCState(this.dlc)
      }
    })
  }

  onRebroadcastFundingTransaction() {
    console.debug('onRebroadcastFundingTransaction()')

    const contractId = this.dlc.contractId

    // Request failed: Cannot broadcast the dlc when it is in the state=Confirmed contractId=Some(ByteVector(32 bytes, 0x0b528a26f38475faa95ce3738612213cf70fe35a2be0d3d67df9e8234a40f72c))

    this.messsageService.sendMessage(getMessageBody(WalletMessageType.broadcastdlcfundingtx, [contractId])).subscribe(r => {
      console.debug('broadcastdlcfundingtx', r)

      if (r.result) {
        // Show success
        const config: any = { verticalPosition: 'top', duration: 3000 }
        this.snackBar.open(this.translate.instant('contractDetail.fundingRebroadcastSuccess'),
          this.translate.instant('action.dismiss'), config)

        // Let polling take care of changing future state?
      }
    })
  }

  onRebroadcastClosingTransaction() {
    console.debug('onRebroadcastClosingTransaction()')

    const txId = this.dlc.closingTxId

    if (txId) {
      this.messsageService.sendMessage(getMessageBody(WalletMessageType.gettransaction, [txId])).subscribe(r => {
        // console.debug('gettransaction', r)

        if (r.result) {
          const rawTransactionHex = r.result

          this.messsageService.sendMessage(getMessageBody(WalletMessageType.sendrawtransaction, [rawTransactionHex])).subscribe(r => {
            // console.debug('sendrawtransaction', r)

            if (r.result) { // closing tx id
              // Show success
              const config: any = { verticalPosition: 'top', duration: 3000 }
              this.snackBar.open(this.translate.instant('contractDetail.closingRebroadcastSuccess'),
                this.translate.instant('action.dismiss'), config)
            }
          })
        }
      })
    }
  }

  viewOnOracleExplorer() {
    console.debug('viewOnOracleExplorer()')

    // val dlc = selectionModel.value.getSelectedItem
    // val primaryOracle =
    //   dlc.oracleInfo.singleOracleInfos.head.announcement
    // val url =
    //   GUIUtil.getAnnouncementUrl(GlobalData.network, primaryOracle)
    // GUIUtil.openUrl(url)
  }

}
