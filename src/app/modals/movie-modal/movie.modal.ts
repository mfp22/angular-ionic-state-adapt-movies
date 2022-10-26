import {
  Component,
  ViewEncapsulation,
  OnInit,
  Renderer2,
  AfterViewInit
} from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';
import { FormErrorHandlerService } from '@services/form-error-hanlder/form-error-handler.service';
import { MovieForm } from '@models/form.model';
import { MovieState } from '@store/state/movies.state';

@Component({
  selector: 'app-movie-modal',
  templateUrl: 'movie.modal.html',
  styleUrls: ['./movie.modal.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MovieModalComponent implements OnInit, AfterViewInit {
  modal: any = {
    title: '',
    buttonText: ''
  };

  movieForm: FormGroup;
  errorsForm: any = {};

  // Reads the name of the store from the store class.
  movieForm$ = this.movieState.movieForm$;

  genres = [
    { id: 1, name: 'Action', image: 'assets/movies-genres/action.png' },
    { id: 2, name: 'Comedy', image: 'assets/movies-genres/comedy.png' },
    { id: 3, name: 'Crime', image: 'assets/movies-genres/crime.png' },
    {
      id: 4,
      name: 'Documentary',
      image: 'assets/movies-genres/documentary.png'
    },
    { id: 5, name: 'Drama', image: 'assets/movies-genres/drama.png' },
    { id: 6, name: 'Fantasy', image: 'assets/movies-genres/fantasy.png' },
    { id: 7, name: 'Film noir', image: 'assets/movies-genres/film noir.png' },
    { id: 8, name: 'Horror', image: 'assets/movies-genres/horror.png' },
    { id: 9, name: 'Romance', image: 'assets/movies-genres/romance.png' },
    {
      id: 10,
      name: 'Science fiction',
      image: 'assets/movies-genres/science fiction.png'
    },
    { id: 11, name: 'Westerns', image: 'assets/movies-genres/westerns.png' }
  ];

  constructor(
    private movieState: MovieState,
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    public navParams: NavParams,
    private renderer: Renderer2,
    private formErrorHandler: FormErrorHandlerService
  ) {
    this.createForm();
    this.formErrorHandler.handleErrors(this.movieForm, this.errorsForm);
  }

  createForm() {
    this.movieForm = this.formBuilder.group<MovieForm>({
      id: new FormControl('', { nonNullable: true }),
      title: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      year: new FormControl(new Date().getFullYear(), {
        nonNullable: true,
        validators: [Validators.required]
      }),
      director: new FormControl('', { nonNullable: true }),
      cast: new FormControl('', { nonNullable: true }),
      genre: new FormControl('Action', { nonNullable: true }),
      notes: new FormControl('', { nonNullable: true }),
      poster: new FormControl('', { nonNullable: true })
    });

    this.movieForm$.subscribe((data) => {
      if (data['model'] !== null && data['status'] === 'PENDING') {
        // Check if the user has added information about a movie but has not inserted it.
        this.movieForm.patchValue(data['model']);
      }
    });
  }

  ngOnInit() {
    this.modal = { ...this.navParams.data.modalProps };
    if (this.navParams.data.option === 'edit') {
      this.movieForm.patchValue(this.navParams.data.modalProps.movie);
    }
  }

  ngAfterViewInit() {
    const element = this.renderer.selectRootElement('#myInput');
    setTimeout(() => element.focus(), 3000);
  }

  dismiss(data?: any) {
    // Using the injected ModalController this page
    // can "dismiss" itself and pass back data.
    if (this.navParams.data.option === 'add') {
      this.movieState.store.submitMovieForm(data);
    }
    this.modalCtrl.dismiss(data);
  }

  movieFormSubmit() {
    if (this.navParams.data.option === 'add') {
      this.movieState.addMovie$.next(this.movieForm.value);
      this.movieState.addMovieRequest.success$.subscribe(() =>
        this.clearMovieForm()
      );
    } else if (this.navParams.data.option === 'edit') {
      this.movieState.updateMovie$.next(this.movieForm.value);
    }
  }

  clearMovieForm() {
    this.movieForm.reset();
    this.movieState.store.resetMovieForm(undefined);
  }

  takePicture() {
    console.log('takePicture');
  }
}
