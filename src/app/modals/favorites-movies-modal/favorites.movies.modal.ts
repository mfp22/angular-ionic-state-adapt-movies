import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { ModalController, NavParams, AlertController } from '@ionic/angular';

import { Movie } from '@models/movie.model';

import { Router } from '@angular/router';
import { MovieState } from '@store/state/movies.state';

@Component({
  selector: 'app-favorites-movies-modal',
  templateUrl: 'favorites.movies.modal.html',
  styleUrls: ['./favorites.movies.modal.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FavoritesMoviesModalComponent implements OnInit {
  modal: any = {
    title: ''
  };

  constructor(
    private movieState: MovieState,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.modal = { ...this.navParams.data.modalProps };
  }

  dismiss() {
    // Using the injected ModalController this page
    // can "dismiss" itself and pass back data.
    this.modalCtrl.dismiss();
  }

  viewMovieDetails(movie: Movie) {
    const movieDetailsURL = `/detail/${movie.id}`;
    this.router.navigate([movieDetailsURL]);
    this.modalCtrl.dismiss();
  }

  deleteFavoriteMovie(movie: Movie) {
    console.log(
      'FavoritesMoviesModalComponent::deleteFavoriteMovie() | method called'
    );
    this.movieState.store.removeFavorites(movie);
    this.modal.favoritesMovies = this.modal.favoritesMovies.filter(
      (m) => m.title !== movie.title
    );
  }

  deleteAll() {
    console.log('FavoritesMoviesModalComponent::deleteAll() | method called');
    this.modal.favoritesMovies = [];
    const state = JSON.parse(localStorage.getItem('@@STATE'));
    state.catalog.favorites = [];
    this.movieState.store.resetFavorites(undefined);
  }

  async presentAlertConfirm() {
    const alert = await this.alertCtrl.create({
      header: 'Delete all favorites',
      message: 'Are you sure you want to delete all the favorites?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Okay',
          handler: () => {
            this.deleteAll();
          }
        }
      ]
    });

    await alert.present();
  }
}
