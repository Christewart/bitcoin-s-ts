import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '~service/auth.service'

import { BackendService } from '~service/backend.service'
import { DLCFileService, DLCFileType } from '~service/dlc-file.service'
import { WalletServiceState, WalletStateService } from '~service/wallet-state-service'
import { WebsocketService } from '~service/websocket.service'
import { formatNumber } from '~util/utils'


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  public DLCFileType = DLCFileType
  public WalletServiceState = WalletServiceState
  public formatNumber = formatNumber

  @Output() showConfiguration: EventEmitter<void> = new EventEmitter()
  @Output() showAdvanced: EventEmitter<void> = new EventEmitter()

  constructor(public walletStateService: WalletStateService, public backendService: BackendService,
    public dlcFileService: DLCFileService, public authService: AuthService, private router: Router,
    private websocketService: WebsocketService) { }

  ngOnInit(): void {
  }

  onConfiguration() {
    console.debug('onConfiguration()')
    this.showConfiguration.emit()
  }

  onAdvanced() {
    console.debug('onAdvanced()')
    this.showAdvanced.emit()
  }

  onLogout() {
    console.debug('onLogout()')
    this.authService.logout().subscribe(result => {
      // Shut down polling
      this.websocketService.stopPolling()
      this.walletStateService.stopPolling()
    })
  }

}
