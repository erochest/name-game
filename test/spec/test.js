(() => {
  'use strict';

  beforeEach(() => localforage.removeItem('stats'));

  describe('getStats', () => {
    it('should return an object counting attempts.', () =>
      window.getStats()
        .then((stats) => stats.should.have.property('attempts'))
    );

    it('should return an object counting successes.', () =>
      window.getStats()
        .then((stats) => stats.should.have.property('correct'))
    );

    it('should return an object counting successes in the current streak.', () =>
      window.getStats()
        .then((stats) => stats.should.have.property('streak'))
    );
  });

  describe('clearStats', () => {
    beforeEach(() => localforage.setItem('stats', new Stats()));

    it('should reset the counts to 0.', () =>
      clearStats()
        .then(getStats)
        .then((stats) => {
          stats.should.have.property('attempts').equal(0);
          stats.should.have.property('correct' ).equal(0);
          stats.should.have.property('streak'  ).equal(0);
        })
    );
  });

  describe('addAttempt', () => {
    beforeEach(() =>
      localforage.setItem(
        'stats',
        Stats.fromObject({attempts: 42, correct: 13, streak: 4})
      )
      .then(getStats)
      .then(stats => console.log(stats))
    );

    it('should add one to the attempts.', () =>
      addAttempt(false)
        .then(getStats)
        .then(stats => stats.attempts.should.equal(43)));

    it('should add one to the attempts when given sequentially.', () =>
      addAttempt(false)
        .then(() => addAttempt(false))
        .then(() => addAttempt(true ))
        .then(getStats)
        .then(stats => stats.attempts.should.equal(45)));

    describe('when passed true.', () => {
      it('should add to to correct.', () =>
        addAttempt(true)
          .then(getStats)
          .then(stats => stats.correct.should.equal(14)));

      it('should add to the streak.', () =>
        addAttempt(true)
          .then(getStats)
          .then(stats => stats.streak.should.equal(5)));
    });

    describe('when passed false.', () => {
      it('should not add to the correct count.', () =>
        addAttempt(false)
          .then(getStats)
          .then(stats => stats.correct.should.equal(13)));

      it('should reset the streak.', () =>
        addAttempt(false)
          .then(getStats)
          .then(stats => stats.streak.should.equal(0)));
    });
  });
})();
