import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

// NGXS
import { MovieState } from '@store/state/movies.state';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { MoviesService } from '@services/movies/movies-service';
import { SearchImageService } from '@services/search-image/search-image-service';
import { YoutubeApiService } from '@services/youtube-api/youtube-api-service';
import { actionSanitizer, stateSanitizer } from '@state-adapt/core';
import { provideStore } from '@state-adapt/angular';
// import { GenreCarouselComponent } from './components/genre-carousel/genre-carousel.component';

const enableReduxDevTools = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.({
  actionSanitizer,
  stateSanitizer: (state: any) => {
    const newState = stateSanitizer(state);
    localStorage.setItem('@@STATE', JSON.stringify(newState));
    return newState;
  }
});

export const storeProvider = provideStore(enableReduxDevTools);

@NgModule({
  declarations: [
    AppComponent
    // GenreCarouselComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    IonicModule.forRoot()
  ],
  providers: [
    MovieState,
    MoviesService,
    YoutubeApiService,
    SearchImageService,
    storeProvider
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
