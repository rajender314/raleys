import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { DialogsModule } from './dialogs/dialogs.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LicenseManager } from 'ag-grid-enterprise';
import { AdorderlistComponent } from './adorderlist/adorderlist.component';
LicenseManager.setLicenseKey(
  'Enterpi_Software_Solutions_Private_Limited_MultiApp_1Devs21_August_2019__MTU2NjM0MjAwMDAwMA==f0a6adf3f22452a5a3102029b1a87a43'
);
@NgModule({
  declarations: [AppComponent, AdorderlistComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
