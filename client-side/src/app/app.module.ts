import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PepAddonService, PepNgxLibModule } from '@pepperi-addons/ngx-lib';

import { TranslateModule, TranslateLoader, TranslateStore } from '@ngx-translate/core';

import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { AddonComponent } from './addon/addon.component';
import { SwaggerUiComponent } from './swagger-ui/swagger-ui.component';
import { AddonService } from './addon/addon.service';
import { PepSizeDetectorModule} from '@pepperi-addons/ngx-lib/size-detector';

import { PepTopBarModule } from '@pepperi-addons/ngx-lib/top-bar';
import { PepPageLayoutModule } from '@pepperi-addons/ngx-lib/page-layout';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    declarations: [
        AppComponent,
        AddonComponent,
        SwaggerUiComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        PepNgxLibModule,
        PepSizeDetectorModule,
        PepTopBarModule,
        PepPageLayoutModule,
        MatTabsModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: PepAddonService.createMultiTranslateLoader,
                deps: [PepAddonService]
            }
        })
    ],
    exports: [
        
        AddonComponent,
        SwaggerUiComponent,
    ],
    providers: [
        TranslateStore,
        AddonService,
        // When loading this module from route we need to add this here (because only this module is loading).
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}