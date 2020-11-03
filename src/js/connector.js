const CORRECT_ICON = 'src/icon/correct.svg';


let setBadges = function(t, flag){
    return t.card('name')
        .get('name')
        .then(function(cardName){
            if (flag) {
                return {
                    text: 'Approved',
                    icon: CORRECT_ICON,
                    color: 'green'
                }
            } else {
                return {
                    text: 'Invalid',
                    icon: CORRECT_ICON,
                    color: 'red'
                }
            }

        });
}

let checkDesc = function(t){
    return t.card('desc')
        .get('desc')
        .then(function(cardDesc){
            if (cardDesc) {
                let splitFrom = cardDesc.split("from")[1].match(/\d/g);
                let splitTo = cardDesc.split("to")[1].match(/\d/g);
                setBadges(t, splitFrom && splitTo);
            }
        });
}

window.TrelloPowerUp.initialize({
    'card-badges': function(t, options){
        return checkDesc(t);
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

