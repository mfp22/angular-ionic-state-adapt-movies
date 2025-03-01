// Angular
import {
  Component,
  ViewEncapsulation,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';

// Ionic
import {
  ModalController,
  PopoverController,
  IonInfiniteScroll,
  IonContent
} from '@ionic/angular';

// Project
import { MovieModalComponent } from '@modals/movie-modal/movie.modal';
import { FavoritesMoviesModalComponent } from '@modals/favorites-movies-modal/favorites.movies.modal';
import { FilterMoviePopoverComponent } from '@popovers/filter-movie.popover';
import { Movie } from '@models/movie.model';
import { IziToastService } from '@services/izi-toast/izi-toast.service';
import { AsyncEvent } from '@models/custom-event.model';
import { MovieState } from '@store/state/movies.state';
import { first, tap } from 'rxjs';

@Component({
  selector: 'app-page-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {
  @ViewChild('infiniteScroll', { read: ElementRef, static: true })
  infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonContent, { read: ElementRef, static: true })
  content: IonContent;

  // Reads the name of the store from the store class.
  movies$ = this.movieState.movies$.pipe(tap((m) => console.log('movies', m)));

  currentYear = new Date().getFullYear();
  start: number;
  end: number;
  showScrollTop: Boolean = false;
  showSkeleton: Boolean = true;
  iconView = 'apps';

  constructor(
    private movieState: MovieState,
    private router: Router,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private iziToast: IziToastService
  ) {
    this.start = 0;
    this.end = 20;
  }

  ngOnInit() {
    this.fetchMovies(this.start, this.end);
    // Check if we have movies in local storage.
    if (localStorage.getItem('@@STATE') !== 'undefined') {
      const state = JSON.parse(localStorage.getItem('@@STATE'));
      console.log('state', state);
    }

    this.movieState.addMovieRequest.success$.subscribe(() => {
      this.modalCtrl.dismiss();
      this.iziToast.success('Add movie', 'Movie added successfully.');
    });
    this.movieState.addMovieRequest.error$.subscribe((err) =>
      console.log(
        'HomePage::ngOnInit ofActionSuccessful(AddMovie) | method called -> received error' +
          err
      )
    );
    this.movieState.updateMovieRequest.success$.subscribe(() => {
      this.modalCtrl.dismiss();
      this.iziToast.success('Edit movie', 'Movie updated successfully.');
    });
    this.movieState.updateMovieRequest.error$.subscribe((err) =>
      console.log(
        'HomePage::ngOnInit ofActionSuccessful(EditMovie) | method called -> received error' +
          err
      )
    );

    this.movieState.deleteMovieRequest.success$.subscribe(() => {
      this.iziToast.success('Delete movie', 'Movie deleted successfully.');
    });
    this.movieState.deleteMovieRequest.error$.subscribe((err) =>
      console.log(
        'HomePage::ngOnInit ofActionSuccessful(DeleteMovie) | method called -> received error' +
          err
      )
    );
  }

  fetchMovies(start: number, end: number) {
    console.log('HomePage::fetchMovies | method called', start, end);
    this.movieState.scrollRangeChange$.next({ start, end });
    this.movieState.moviesRequest.success$.subscribe(() => {
      setTimeout(() => {
        this.showSkeleton = false;
      }, 2000);
    });
  }

  viewMovieDetails(movie: Movie) {
    const movieDetailsURL = `/detail/${movie.id}`;
    this.router.navigate([movieDetailsURL]);
  }

  async presentModal(componentProps: any, component) {
    const modal = await this.modalCtrl.create({
      component: component,
      componentProps: componentProps
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      console.log('data', data);
    }
  }

  addMovie() {
    const componentProps = {
      modalProps: { title: 'Add Movie', buttonText: 'Add Movie' },
      option: 'add'
    };
    this.presentModal(componentProps, MovieModalComponent);
  }

  editMovie(movie: Movie) {
    const componentProps = {
      modalProps: {
        title: 'Edit Movie',
        buttonText: 'Edit Movie',
        movie: movie
      },
      option: 'edit'
    };
    this.presentModal(componentProps, MovieModalComponent);
  }

  deleteMovie(movie: Movie) {
    this.movieState.deleteMovie$.next(movie);
  }

  doInfinite(event: Event) {
    const customEvent = event as AsyncEvent;
    setTimeout(() => {
      customEvent.target.complete();
      this.showSkeleton = true;
      this.start = this.end;
      this.end += 20;
      this.showScrollTop = true;
      this.fetchMovies(this.start, this.end);
    }, 500);
  }

  async presentPopover(event: MouseEvent) {
    const popover = await this.popoverCtrl.create({
      component: FilterMoviePopoverComponent,
      event: event
    });

    await popover.present();

    const { data } = await popover.onWillDismiss();

    if (data) {
      console.log('data popover.onWillDismiss', data);
    }
  }

  scrollToTop() {
    this.content['nativeElement'].scrollToTop();
  }

  changeView() {
    console.log('HomePage::changeView() | method called');
    this.iconView = this.iconView === 'apps' ? 'list' : 'apps';
  }

  showFavoritesMovies() {
    console.log('HomePage::showFavoritesMovies() | method called');
    const state = JSON.parse(localStorage.getItem('@@STATE'));
    console.log('state', state);
    const componentProps = {
      modalProps: {
        title: 'Favorites Movies',
        favoritesMovies: state.catalog.favorites
      }
    };
    this.presentModal(componentProps, FavoritesMoviesModalComponent);
  }
}
