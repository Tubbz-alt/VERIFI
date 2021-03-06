import { __decorate } from "tslib";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AccountComponent } from './account/account/account.component';
import { FacilityComponent } from './account/facility/facility.component';
import { UtilityComponent } from './utility/utility.component';
import { EnergyConsumptionComponent } from './utility/energy-consumption/energy-consumption.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DataTableComponent } from './utility/data-table/data-table.component';
import { EnergySourceComponent } from './utility/energy-consumption/energy-source/energy-source.component';
import { HelpPanelComponent } from './utility/help-panel/help-panel.component';
import { ElectricityComponent } from './utility/energy-consumption/electricity/electricity.component';
const dbConfig = {
    name: 'verifi',
    version: 4.1,
    objectStoresMeta: [{
            store: 'accounts',
            storeConfig: { keyPath: 'id', autoIncrement: true },
            storeSchema: [
                { name: 'name', keypath: 'name', options: { unique: false } },
                { name: 'industry', keypath: 'industry', options: { unique: false } },
                { name: 'naics', keypath: 'naics', options: { unique: false } },
                { name: 'notes', keypath: 'notes', options: { unique: false } },
                { name: 'img', keypath: 'img', options: { unique: false } }
            ]
        },
        {
            store: 'facilities',
            storeConfig: { keyPath: 'id', autoIncrement: true },
            storeSchema: [
                { name: 'facilityid', keypath: 'facilityid', options: { unique: true } },
                { name: 'accountid', keypath: 'accountid', options: { unique: false } },
                { name: 'name', keypath: 'name', options: { unique: false } },
                { name: 'country', keypath: 'country', options: { unique: false } },
                { name: 'state', keypath: 'state', options: { unique: false } },
                { name: 'address', keypath: 'address', options: { unique: false } },
                { name: 'type', keypath: 'type', options: { unique: false } },
                { name: 'tier', keypath: 'tier', options: { unique: false } },
                { name: 'size', keypath: 'size', options: { unique: false } },
                { name: 'units', keypath: 'units', options: { unique: false } },
                { name: 'division', keypath: 'division', options: { unique: false } },
                { name: 'img', keypath: 'img', options: { unique: false } }
            ]
        }]
};
let AppModule = class AppModule {
};
AppModule = __decorate([
    NgModule({
        declarations: [
            AppComponent,
            HeaderComponent,
            FooterComponent,
            SidebarComponent,
            AccountComponent,
            FacilityComponent,
            UtilityComponent,
            EnergyConsumptionComponent,
            DashboardComponent,
            DataTableComponent,
            EnergySourceComponent,
            HelpPanelComponent,
            ElectricityComponent
        ],
        imports: [
            NgxIndexedDBModule.forRoot(dbConfig),
            NgxWebstorageModule.forRoot(),
            BrowserModule,
            AppRoutingModule,
            BrowserAnimationsModule,
            FormsModule,
            ReactiveFormsModule
        ],
        providers: [],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map