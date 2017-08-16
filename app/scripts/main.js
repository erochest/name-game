(() => {

  // TODO: pre-cache images

  const sessionSize = 5;
  const statsKey    = 'stats';


  class GuessHandler {
    constructor(people, photos, resolve) {
      this.people  = people;
      this.photos  = photos;
      this.resolve = resolve;
    }

    handleEvent(ev) {
      if (ev.key >= '1' && ev.key <= '5') {
        var n       = +ev.key;
        var correct = GuessHandler.handleGuess(
            this.people,
            this.photos[n-1].querySelector('.shade'),
            this.resolve
          );
        if (correct) {
          window.removeEventListener('keypress', this, false);
        }
      }
    }

    static install(people, photos, resolve) {
      var listener = new GuessHandler(people, photos, resolve);

      photos.forEach(photo =>
        photo.addEventListener(
          'click',
          ev => GuessHandler.handleGuess(people, ev.target, resolve),
          { once: true }
        ));
      window.addEventListener('keypress', listener, false);

      return listener;
    }

    static handleGuess(people, image, resolve) {
      var name    = document.querySelector('#name'),
          correct = false;

      if (name.dataset.n === image.dataset.n) {
        var person = people[name.dataset.n];
        image.parentElement.classList.add('correct');
        person.last_correct = new Date();
        addAttempt(true)
          .then(displayStats)
          .then(() => savePerson(person))
          .then(() => timeout(3500))
          .then(resolve);
        correct = true;
      } else {
        image.parentElement.classList.add('wrong');
        addAttempt(false)
          .then(displayStats);
      }

      return correct;
    }
  }

  class Person {
    constructor(id, name, image_url, last_correct) {
      this.id           = id;
      this.name         = name;
      this.url          = image_url;
      this.last_correct = last_correct;
    }

    static fromAPI(obj) {
      return new Person(
        obj.id,
        obj.firstName + ' ' + obj.lastName,
        obj.headshot != null ? obj.headshot.url : obj.url,
        new Date()
      )
    }

    static fromStorage(obj) {
      return new Person(
        obj.id,
        obj.name,
        obj.url,
        obj.last_correct
      );
    }
  }

  class Stats {
    constructor() {
      this.attempts = 0;
      this.correct  = 0;
      this.streak   = 0;
    }

    addAttempt(correct=false) {
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
      .getItem(statsKey)
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
    return localforage.setItem(statsKey, new Stats());
  }

  function addAttempt(correct=false) {
    return getStats()
      .then(stats => {
        stats.addAttempt(correct);
        return stats;
      })
      .then(stats => localforage.setItem(statsKey, stats));
  }

  window.Stats      = Stats;
  window.getStats   = getStats;
  window.clearStats = clearStats;
  window.addAttempt = addAttempt;

  function displayStats(stats) {
    var div  = document.querySelector('#stats');
    var html = `
      <span class="attempts">${stats.attempts}</span> tries   /
      <span class="correct" >${stats.correct }</span> correct /
      <span class="streak"  >${stats.streak  }</span> streak
      `;
    div.innerHTML = html;
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

  // weightedRand :: Array x -> (x -> Number) -> x
  function weightedRand(array, weight) {
    return weightedRandArray(weightArray(array, weight));
  }

  function weightArray(array, weight) {
    var weighted = array
      .map(x => { return {value: x, weight: weight(x)}; })
      .sort((a, b) => b - a);
    var weightSum = weighted.reduce((a, b) => a + b.weight, 0);
    weighted.forEach(item => item.weight = item.weight / weightSum);
    return weighted;
  }

  function weightedRandArray(weighted) {
    var n      = Math.random(),
        accum  = 0.0,
        result = null;

    for (var item of weighted) {
      accum  += item.weight;
      result  = item.value;
      if (accum >= n) {
        break;
      }
    }

    return result;
  }

  // weightedRandomN :: Array x -> Number -> (x -> Number) -> Array x
  function weightedRandomN(array, size, weight) {
    var result = array;

    if (size < array.length) {
      var seen     = new Set(),
          weighted = weightArray(array, weight);
      result = [];

      while (result.length < size) {
        var item = weightedRandArray(weighted);
        if (! seen.has(item.url)) {
          seen.add(item.url);
          result.push(item);
        }
      }
    }

    return result;
  }

  window.weightedRand    = weightedRand;
  window.weightedRandomN = weightedRandomN;

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
          <div data-n="${i}" class="shade">${i + 1}</div>
          <div class="name">${person.name}</div>
          <img src="${person.url}">
        </div>
        `;
    });

    gallery.innerHTML = buffer;
  }


  function attachListeners(resolve, people) {
    var photos   = document.querySelectorAll('#gallery .photo');
    var listener = GuessHandler.install(people, photos, resolve);
    return listener;
  }

  // playRound :: People -> Promise x
  function playRound(people) {
    var now     = new Date();
    var round   = weightedRandomN(people, sessionSize,
                                  p => now - p.last_correct);
    var targetI = randomInt(sessionSize - 1);
    var testFor = round[targetI];

    return new Promise((resolve, reject) => {
      displayName(targetI, testFor);
      displayGallery(round);
      attachListeners(resolve, round);
    });
  }

  function syncPeople(people) {
    return Promise.all(people.map(syncPerson));
  }

  function syncPerson(person) {
    var key = person.id;
    return localforage.getItem(key)
      .then(p => {
        var next = null;
        if (p === null) {
          next = localforage.setItem(key, person);
        } else {
          next = Promise.resolve(p);
        }
        return next;
      })
      .then(p => Person.fromStorage(p));
  }

  function savePerson(person) {
    return localforage.setItem(person.url, person);
  }

  function readPeople() {
    return localforage.keys()
      .then(keys => Promise.all(keys.filter(k => k !== statsKey)
                                    .map(k => localforage.getItem(k))))
      .then(values => values.filter(v => v !== null)
                            .map(v => Person.fromStorage(v)));
  }
  window.readPeople = readPeople;

  function* step(by) {
    var current = 0;
    while (true) {
      yield current;
      current += by;
    }
  }

  function main() {
    getStats().then(displayStats);
    // TODO: pagination
    step(100)
      .map(skip => {
        var url = 'https://willowtreeapps.com/api/v1.0/profiles?skip=' + skip;
        $.getJSON(url)
          .promise()
          .done(data => {
            console.log(data)
            var people = data.items
              .map(item => Person.fromAPI(item))
              .filter(p => p.url != null)
            syncPeople(people)
              .then(people => (forever(() => playRound(people))))
          });
      })
  }
  window.main = main;
})();
