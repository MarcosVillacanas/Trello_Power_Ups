const CORRECT_ICON = '../icon/correct.svg';


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
                let splitFrom = cardDesc.split("from")[1].split("to")[0];
                let splitTo = cardDesc.split("to")[1].split(" ")[1];
                console.log(splitFrom + " " + splitTo);
                setBadges(t, /\d/.test(splitFrom) && /\d/.test(splitTo));
            }
        });
}

window.TrelloPowerUp.initialize({
    'card-badges': function(t, options){
        return setBadges(checkDesc(t));
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

