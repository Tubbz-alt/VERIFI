import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Injectable } from '@angular/core';
import { IdbAccount } from '../models/idb';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
    providedIn: 'root'
})
export class AccountdbService {

    selectedAccount: BehaviorSubject<IdbAccount>;
    allAccounts: BehaviorSubject<Array<IdbAccount>>;
    constructor(private dbService: NgxIndexedDBService, private localStorageService: LocalStorageService) {
        this.selectedAccount = new BehaviorSubject<IdbAccount>(undefined);
        this.allAccounts = new BehaviorSubject<Array<IdbAccount>>(new Array());
        this.setAllAccounts();
        let localStorageAccountId: number = this.localStorageService.retrieve("accountId");
        this.setSelectedAccount(localStorageAccountId);

        this.selectedAccount.subscribe(account => {
            if (account) {
                this.localStorageService.store("accountId", account.id);
            }
        });
    }

    setSelectedAccount(accountId: number) {
        if (accountId) {
            this.getById(accountId).subscribe(account => {
                this.selectedAccount.next(account);
            });
        } else {
            let allAccounts: Array<IdbAccount> = this.allAccounts.getValue();
            if (allAccounts.length != 0) {
                this.setSelectedAccount(allAccounts[0].id);
            } else {
                this.addTestData();
            }
        }
    }

    setAllAccounts() {
        this.getAll().subscribe(allAccounts => {
            this.allAccounts.next(allAccounts);
        });
    }

    getAll(): Observable<Array<IdbAccount>> {
        return this.dbService.getAll('accounts');
    }

    getById(accountId: number): Observable<IdbAccount> {
        return this.dbService.getByKey('accounts', accountId);
    }

    count() {
        return this.dbService.count('accounts');
    }

    add(account: IdbAccount): void {
        this.dbService.add('accounts', account).subscribe(newAccountId => {
            this.setAllAccounts();
            this.setSelectedAccount(newAccountId);
        });
    }

    update(account: IdbAccount): void {
        this.dbService.update('accounts', account).subscribe(() => {
            this.setAllAccounts();
            this.setSelectedAccount(account.id);
        });
    }

    deleteById(accountId: number): void {
        this.dbService.delete('accounts', accountId).subscribe(() => {
            this.setAllAccounts();
        });
    }

    //TODO: MOVE
    // *WARNING* Can not be undone
    deleteDatabase() {
        this.dbService.deleteDatabase().subscribe(
            () => {
                console.log('Database deleted successfully');
            },
            error => {
                console.log(error);
            }
        );
    }
    addTestData() {
        TestAccountData.forEach(accountItem => {
            this.add(accountItem);
        });
    }

    getNewIdbAccount(): IdbAccount {
        return {
            name: 'New Account',
            industry: '',
            naics: '000000',
            notes: '',
            img: 'https://placehold.it/50x50',
            // id: undefined
        }
    }
}


export const TestAccountData: Array<IdbAccount> = [
    {
        // id: undefined,
        name: 'Captain Crunch',
        industry: 'Cereal',
        naics: '123456',
        notes: 'Delicious',
        img: 'https://placehold.it/50x50'
    },
    {
        // id: undefined,
        name: 'Mini Wheets',
        industry: 'Cereal',
        naics: '555555',
        notes: 'The frosted kind',
        img: 'https://placehold.it/50x50'
    },
    {
        // id: undefined,
        name: 'Special K',
        industry: 'Cereal',
        naics: '234567',
        notes: 'Not the worst',
        img: 'https://placehold.it/50x50'
    }
]