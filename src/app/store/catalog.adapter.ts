import { Movie } from '@models/movie.model';
import { createAdapter, joinAdapters } from '@state-adapt/core';
import { stringAdapter } from '@state-adapt/core/adapters';

const GENRES: string[] = [
  'action',
  'comedy',
  'crime',
  'documentary',
  'drama',
  'fantasy',
  'film noir',
  'horror',
  'romance',
  'science fiction',
  'westerns',
  'animation'
];

const moviesAdapter = createAdapter<Movie[]>()({
  receive: (state, movies: Movie[]) => [
    ...state,
    ...movies.map((movie) => {
      const genre = movie.genre.toLowerCase().split(',', 1)[0];
      return GENRES.indexOf(genre) === -1
        ? movie
        : { ...movie, genreImage: 'assets/movies-genres/' + genre + '.png' };
    })
  ],
  add: (state, movie: Movie) => [...state, movie],
  update: (state, update: Movie) =>
    state.map((movie) => (movie.id !== update.id ? movie : update)),
  remove: (state, remove: Movie) =>
    state.filter((movie) => movie.id !== remove.id),
  selectors: {
    byId: (state) => (id: string) => state.filter((movie) => movie.id === id)[0]
  }
});

interface MovieForm {
  model: Movie;
  dirty: boolean;
  status: string;
  errors: {};
}

const statusAdapter = createAdapter<string>()({
  setToPending: () => 'PENDING',
  selectors: {}
});
const movieAdapter = createAdapter<Movie>()({ selectors: {} });

const movieFormAdapter = joinAdapters<MovieForm>()({
  status: statusAdapter,
  model: movieAdapter
})({
  submit: {
    status: statusAdapter.setToPending,
    model: movieAdapter.set
  }
})();

interface Filter {
  genre: string;
  years: {
    lower: number;
    upper: number;
  };
  rate: number;
}

export interface CatalogStateModel {
  movies: Movie[];
  movieForm: MovieForm;
  filter: Filter;
  favorites: Movie[];
}

export const catalogAdapter = joinAdapters<CatalogStateModel>()({
  movies: moviesAdapter,
  movieForm: movieFormAdapter,
  filter: createAdapter<Filter[]>()({ selectors: {} }),
  favorites: moviesAdapter
})();
