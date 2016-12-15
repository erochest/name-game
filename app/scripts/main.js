$(() => {

  // TODO: pre-cache images

  const sessionSize = 5;

  // forever :: (() -> Promise x) -> Promise x
  function forever(f) {
    var promise = f();
    return promise.then(() => forever(f));
  }

  // timeout :: Number -> Promise ()
  function timeout(delay, value=null) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => resolve(value), delay);
    });
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
          <div class="shade">${person.name}</div>
          <img data-n="${i}" src="${person.url}">
        </div>
        `;
    });

    gallery.innerHTML = buffer;
  }

  function attachListeners(resolve) {
    var photos = document.querySelectorAll('#gallery .photo');

    photos.forEach(photo => {
      photo.addEventListener('click', ev => {
        var name = document.querySelector('#name');

        window.ev = ev;

        if (name.dataset.n === ev.target.dataset.n) {
          ev.target.parentElement.classList.add('correct');
          timeout(2000).then(resolve);
        } else {
          ev.target.parentElement.classList.add('wrong');
        }

      }, { once: true });
    });
  }

  // playRound :: People -> Promise x
  function playRound(people) {
    var round   = randomn(people, sessionSize);
    var targetI = randomInt(sessionSize - 1);
    var testFor = round[targetI];

    return new Promise((resolve, reject) => {
      displayName(targetI, testFor);
      displayGallery(round);
      attachListeners(resolve);
    });
  }

  $.getJSON('http://api.namegame.willowtreemobile.com/')
    .done(data => forever(() => playRound(data)));
});
