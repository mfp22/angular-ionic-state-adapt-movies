// import { StateContext } from '@ngxs/store';
import { YoutubeApiService } from '@services/youtube-api/youtube-api-service';
import { CatalogStateModel } from '../catalog.adapter';
import { catchError, tap, throwError } from 'rxjs';

export const getMovieTrailer =
  (youtubeApiService: YoutubeApiService) =>
  ({ getState, setState }: any, { payload }) => {
    // StateContext<CatalogStateModel>
    return youtubeApiService.searchMovieTrailer(payload.movieTitle).pipe(
      catchError((x, caught) => {
        return throwError(() => new Error(x));
      }),
      tap({
        next: (result) => {},
        error: (error) => {
          console.log('error', error.message);
        }
      })
    );
  };
