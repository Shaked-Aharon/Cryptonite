///<reference path="jquery-3.4.1.js" />
class Coin {
    constructor(id, symbol, name, rank, valueChange) {
        this.id = id;
        this.symbol = symbol;
        this.name = name;
        this.rank = rank;
        this.valueChange = valueChange.toFixed(2)
    }

    display() {
        const checkBoxToggle = `<label class="switch"><input type="checkbox" id="${this.symbol}"><span class="slider round"></span></label>`;
        const h5 = `<h5 class="card-title text-uppercase">${this.symbol}</h5>`
        const p = `<p class="card-text">${this.name}</p>`;
        const b = `<button id="${this.id}" class="btn btn-primary moreInfo" type="button" data-toggle="collapse" data-target=".${this.symbol}" aria-expanded="false" aria-controls="collapseExample">More Info</button>`;
        let p2 = '<p class="valueRank">24h: <span class='+(this.valueChange > 0 ? "valueUp" : "valueDown")+` ><b>${this.valueChange}&#37;</b></span>`;
        p2 += `<br>Rank: <b>${this.rank}</b>`;
        const divCollapse = `<div class="collapse ${this.symbol}"><div class="card card-body"></div></div>`;
        const innerDiv = `<div class="card-body">${h5}${p2}${p}${b}<br><br>${divCollapse}</div>`;
        const div = `<div class="card col-md-4 col-12">${checkBoxToggle}${innerDiv}</div>`;
        $("#coins > #coinsContainer").append(div);
    }
}