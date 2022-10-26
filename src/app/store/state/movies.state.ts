import { Movie } from '@models/movie.model';
import { GetMovieTrailer } from '@store/actions/movies.actions';

import { Injectable } from '@angular/core';
// import { attachAction } from '@ngxs-labs/attach-action';
import { MoviesService } from '@services/movies/movies-service';
import { YoutubeApiService } from '@services/youtube-api/youtube-api-service';
import { adapt } from '@state-adapt/angular';
import { getHttpSources, Source } from '@state-adapt/rxjs';
import { getMovieTrailer } from '@store/actions/movies.actions.impl';
import { catalogAdapter, CatalogStateModel } from '@store/catalog.adapter';
import { merge, startWith, switchMap } from 'rxjs';

const initialState: CatalogStateModel = {
  movies: [],
  movieForm: {
    model: null,
    dirty: false,
    status: '',
    errors: {}
  },
  filter: {
    genre: 'Action',
    years: {
      lower: 1900,
      upper: new Date().getFullYear()
    },
    rate: 0
  },
  favorites: []
};

@Injectable()
export class MovieState {
  scrollRangeChange$ = new Source<{ start: number; end: number }>(
    'scrollRangeChange$'
  );
  moviesRequest = getHttpSources(
    '[Movies]',
    this.scrollRangeChange$.pipe(
      startWith({ payload: { start: 0, end: 20 } }),
      switchMap(({ payload: { start, end } }) =>
        this.moviesService.getMovies(start, end)
      )
    ),
    (res) => [!!res, res, 'Error']
  );

  addMovie$ = new Source<Movie>('addMovie$');
  addMovieRequest = getHttpSources(
    '[Add Movie]',
    this.addMovie$.pipe(
      switchMap(({ payload }) => {
        payload.poster =
          payload.poster === ''
            ? 'https://in.bmscdn.com/iedb/movies/images/website/poster/large/ela-cheppanu-et00016781-24-03-2017-18-31-40.jpg'
            : payload.poster;

        return this.moviesService.addMovie(payload);
      })
    ),
    (res) => [!!res, res, 'Error']
  );

  updateMovie$ = new Source<Movie>('updateMovie$');
  likeMovie$ = new Source<Movie>('likeMovie$');
  commentMovie$ = new Source<Movie>('commentMovie$');
  updateMovieRequest = getHttpSources(
    '[Update Movie]',
    merge(this.updateMovie$, this.likeMovie$, this.commentMovie$).pipe(
      switchMap(({ payload }) => this.moviesService.editMovie(payload))
    ),
    (res) => [!!res, [res], 'Error']
  );

  deleteMovie$ = new Source<Movie>('deleteMovie$');
  deleteMovieRequest = getHttpSources(
    '[Delete Movie]',
    this.deleteMovie$.pipe(
      switchMap(({ payload }) => this.moviesService.deleteMovie(payload))
    ),
    (res) => [!!res, res, 'Error']
  );

  filterChange$ = new Source<any>('filterChange$');

  filterChangeRequest = getHttpSources(
    '[Movies]',
    this.filterChange$.pipe(
      switchMap(({ payload }) => this.moviesService.filterMovies(payload))
    ),
    (res) => [!!res, res, 'Error']
  );

  clearMovies$ = new Source<void>('clearMovies$');
  favoriteMovie$ = new Source<Movie>('favoriteMovie$');
  deleteFavoriteMovie$ = new Source<Movie>('deleteFavoriteMovie$');
  deleteAllFavoriteMovie$ = new Source<void>('deleteAllFavoriteMovie$');

  store = adapt(['catalog', initialState, catalogAdapter], {
    receiveMovies: this.moviesRequest.success$,
    addMovies: this.addMovieRequest.success$,
    updateMovies: this.updateMovieRequest.success$,
    removeMovies: this.deleteMovieRequest.success$,
    setMovies: this.filterChangeRequest.success$,
    setFilter: this.filterChange$,
    resetMovies: this.clearMovies$,
    addFavorites: this.favoriteMovie$,
    removeFavorites: this.deleteFavoriteMovie$,
    resetFavorites: this.deleteAllFavoriteMovie$,
    noop: [
      this.scrollRangeChange$,
      this.moviesRequest.error$,
      this.addMovie$,
      this.addMovieRequest.error$,
      this.updateMovie$,
      this.likeMovie$,
      this.commentMovie$,
      this.updateMovieRequest.error$,
      this.deleteMovie$,
      this.deleteMovieRequest.error$,
      this.filterChange$,
      this.deleteMovieRequest.error$
    ]
  });

  movies$ = this.store.movies$;
  movieById$ = this.store.moviesById$;
  filter$ = this.store.filter$;
  movieForm$ = this.store.movieForm$;

  constructor(
    private moviesService: MoviesService,
    private youtubeApiService: YoutubeApiService
  ) {
    // attachAction(
    //   MovieState,
    //   GetMovieTrailer,
    //   getMovieTrailer(this.youtubeApiService)
    // );
  }
}
