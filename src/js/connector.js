const CORRECT_ICON = '../icon/correct.svg';


let setBadges = function(flag){
    console.log(flag)
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
                console.log("a");
                let splitFrom = cardDesc.split("from")[1].split("to")[0];
                let splitTo = cardDesc.split("to")[1].split(" ")[1];
                return /\d/.test(splitFrom) && /\d/.test(splitTo);
            }
            else {
                console.log("b");
                return false;
            }
        });
}

window.TrelloPowerUp.initialize({
    'card-badges': async function(t, options){
        const prueba = await checkDesc(t);
        const prueba2 = setBadges(prueba);
        return prueba2;
    }
});

/*
Trello available data:
https://developer.atlassian.com/cloud/trello/power-ups/client-library/accessing-trello-data/
*/

