let setBadges = function(flag){
    return {
        text: (flag)? 'APPROVED' : 'INVALID',
        color: (flag)? 'green' : 'red'
    };
}

let checkDesc = function(t){
    return t.card('desc')
        .get('desc')
        .then(function(cardDesc){
            if (cardDesc) {
                try {
                    let splitFrom = cardDesc.split("from")[1].split("to")[0];
                    let splitTo = cardDesc.split("to")[1].split(" ")[1];
                    return /\d/.test(splitFrom) && /\d/.test(splitTo);
                }
                catch (e) {
                    return false
                }
            }
            return false;
        });
}

window.TrelloPowerUp.initialize({
    'card-badges': function(t, options){
        t.set('5fa11e0d7a63eb7b06970345', 'shared', 'desc', 'trying this out');
        console.log(t.getAll());
        return checkDesc(t).then(flag => setBadges(flag));
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

