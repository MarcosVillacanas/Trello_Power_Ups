TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        return t.card('all')
            .then(function(card) {
                console.log(card);
                return[{
                    text: card.idShort
                }];
            })
    }
});

console.log('Hello World!');

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

