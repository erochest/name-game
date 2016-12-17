(() => {

  // TODO: pre-cache images

  const sessionSize = 5;

  class Stats {
    constructor() {
      this.attempts = 0;
      this.correct  = 0;
      this.streak   = 0;
    }

    addAttempt(correct=false) {
      console.trace('addAttempt');
      this.attempts += 1;
      if (correct) {
        this.correct += 1;
        this.streak  += 1;
      } else {
        this.streak = 0;
      }
    }

    static fromObject(obj) {
      var stats = new Stats();

      stats.attempts = obj.attempts;
      stats.correct  = obj.correct;
      stats.streak   = obj.streak;

      return stats;
    }
  }

  function getStats() {
    return localforage
      .getItem('stats')
      .then((value) => {
        if (value === null) {
          value = new Stats();
        } else {
          value = Stats.fromObject(value);
        }
        return value;
      });
  }

  function clearStats() {
    return localforage.setItem('stats', new Stats());
  }

  function addAttempt(correct=false) {
    return getStats()
      .then(stats => {
        // console.log('111', JSON.stringify(stats));
        stats.addAttempt(correct);
        // console.log('222', JSON.stringify(stats));
        return stats;
      })
      .then(stats => localforage.setItem('stats', stats));
  }

  window.Stats      = Stats;
  window.getStats   = getStats;
  window.clearStats = clearStats;
  window.addAttempt = addAttempt;

  function displayStats(stats) {
    console.log(stats);
    return stats;
  }

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
    var buffer  = '';

    people.forEach((person, i) => {
      buffer += `
        <div class="photo">
          <div data-n="${i}" class="shade"></div>
          <div class="name">${person.name}</div>
          <img src="${person.url}">
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

        if (name.dataset.n === ev.target.dataset.n) {
          ev.target.parentElement.classList.add('correct');
          addAttempt(true).then(displayStats);
          timeout(3500).then(resolve);
        } else {
          ev.target.parentElement.classList.add('wrong');
          addAttempt(false).then(displayStats);
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

  function main() {
    $.getJSON('http://api.namegame.willowtreemobile.com/')
      .done(data => forever(() => playRound(data)));
  }
  window.main = main;
})();
