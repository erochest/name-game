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
    var gallery = document.querySelectorAll('.photo img');

    for (var i=0; i<gallery.length; i++) {
      var img    = gallery[i];
      var person = people[i];

      img.setAttribute('src', person.url);
      img.dataset.name = person.name;
    }
  }

  // playRound :: People -> Promise x
  function playRound(people) {
    var round   = randomn(people, sessionSize);
    var targetI = randomInt(sessionSize);
    var testFor = round[targetI];

    displayName(targetI, testFor);
    displayGallery(round);

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
