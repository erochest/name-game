$(() => {

  // TODO: pre-cache images

  const sessionSize = 5;

  // forever :: Promise x -> Promise x
  function forever(promise) {
    return promise.then(() => forever(promise));
  }

  // timeout :: Number -> Promise ()
  function timeout(delay) {
    return new Promise((resolve, reject) => {
      return window.setTimeout(() => resolve(null));
    }
    );
  }

  // randomInt :: Number -> Number
  function randomInt(n) {
    return Math.round(Math.random() * n);
  }

  // randomn :: Array x -> Number -> Array x
  function randomn(array, n) {
    var result = array;

    if (n < array.length) {
      var seen = new Set();
      result = [];

      while (result.length < n) {
        var i = randomInt(array.length);
        if (! seen.has(i)) {
          seen.add(i);
          result.push(array[i]);
        }
      }
    }

    return result;
  }

  function displayName(i, person) {
    var name = document.querySelector('#name');
    name.innerText = person.name;
    name.dataset.n = i;
  }

  function displayGallery(people) {
    var gallery = document.querySelector('#gallery div');
    var buffer  = "";

    people.forEach((person, i) => {
      buffer += `
        <div class="photo">
          <img data-n="${i}" data-name="${person.name}" src="${person.url}">
        </div>
        `;
    });

    gallery.innerHTML = buffer;
  }

  function attachListeners() {
    var photos = document.querySelectorAll('#gallery .photo');

    photos.forEach(photo => {
      photo.addEventListener('click', ev => {
        var name = document.querySelector('#name');

        window.ev = ev;
        console.log(ev);

        ev.target.parentElement.classList.add('answered');
        if (name.dataset.n === ev.target.dataset.n) {
          ev.target.parentElement.classList.add('correct');
          // TODO: timeout
          // TODO: call next item
        } else {
          ev.target.parentElement.classList.add('wrong');
        }

      }, { once: true });
    });
  }

  // playRound :: People -> Promise x
  function playRound(people) {
    var round   = randomn(people, sessionSize);
    var targetI = randomInt(sessionSize);
    var testFor = round[targetI];

    displayName(targetI, testFor);
    displayGallery(round);
    attachListeners();

    // TODO return promise
    // return new Promise((resolve, reject) => {
    // });
  }

  function wireEvents() {
    var name  = document.querySelector('#name');
    var spans = document.querySelectorAll('.photo');

    for (var i=0; i<spans.length; i++) {
      spans[i].addEventListener('click', event => {
        var n = +event.target.dataset.n;
        var answer = +name.dataset.n;

        if (n === answer) {
          console.log('yay!');
        } else {
          console.log('loser');
        }
      });
    }
  }

  wireEvents();
  $.getJSON('http://api.namegame.willowtreemobile.com/')
    .done(data => forever(playRound(data)));
});
