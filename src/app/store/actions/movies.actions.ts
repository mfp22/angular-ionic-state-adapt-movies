export class GetMovieTrailer {
  static readonly type = '[Movies] Get Movie Trailer';

  constructor(public payload: { movieTitle: string }) {}
}
