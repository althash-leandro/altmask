import { observable, action, reaction } from 'mobx';
import { isEmpty } from 'lodash';
const extension = require('extensionizer');

import AppStore from './AppStore';
import { MESSAGE_TYPE } from '../../constants';
import Account from '../../models/Account';

const INIT_VALUES = {
  selectedWalletName: '',
};

export default class AccountLoginStore {
  @observable public selectedWalletName: string = INIT_VALUES.selectedWalletName;
  @observable public accounts: Account[] = [];

  private app: AppStore;

  constructor(app: AppStore) {
    this.app = app;

    // Set the default selected account on the login page.
    reaction(
      () => this.app.sessionStore.networkIndex,
      () => this.getAccounts(),
    );
  }

  @action
  public getAccounts = () => {
    extension.runtime.sendMessage({ type: MESSAGE_TYPE.GET_ACCOUNTS }, (response: any) => {
      if (!isEmpty(response)) {
        this.accounts = response;
        this.setSelectedWallet();
      }
    });
  }

  @action
  public setSelectedWallet = () => {
    if (!isEmpty(this.accounts)) {
      this.selectedWalletName = this.accounts[0].name;
    }
  }

  @action
  public loginAccount = () => {
    this.app.routerStore.push('/loading');
    extension.runtime.sendMessage({
      type: MESSAGE_TYPE.ACCOUNT_LOGIN,
      selectedWalletName: this.selectedWalletName,
    });
  }

  @action
  public routeToCreateWallet = () => {
    this.app.routerStore.push('/create-wallet');
  }

  @action
  public reset = () => Object.assign(this, INIT_VALUES)
}
