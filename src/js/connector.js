let getBadges = function(t){
    return t.card('Test')
        .get('Test')
        .then(function(cardName){
            console.log('We just loaded the card name for fun: ' + cardName);
        });
}

window.TrelloPowerUp.initialize({
    'card-badges': function(t, options){
        return getBadges(t);
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

