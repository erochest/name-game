$(() => {

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

  function displayName(person) {
  }

  function displayGallery(people) {
  }

  // playRound :: People -> Promise x
  function playRound(people) {
    var round   = randomn(people, sessionSize);
    var testFor = round[randomInt(sessionSize)];

    console.log(testFor);

    displayName(testFor);
    displayGallery(round);

    // TODO return promise
    // return new Promise((resolve, reject) => {
    // });
  }

  $.getJSON('http://api.namegame.willowtreemobile.com/')
    .done(data => forever(playRound(data)));
});
