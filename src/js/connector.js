window.TrelloPowerUp.initialize({
    'card-badges': function (t, opts) {
        return t.card('all')
            .then(function (card) {
                console.log(JSON.stringify(card, null, 2));
            });
    }
});

console.log('Hello World!');

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

